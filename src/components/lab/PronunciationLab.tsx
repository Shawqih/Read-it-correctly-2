import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Play,
  Sparkles,
  Star,
  AlertCircle,
  AudioWaveform as WaveformIcon,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface PronunciationLabProps {
  onEarnStar: (stars?: number) => void;
}

interface PhonicsExercise {
  id: string;
  word: string;
  category: string;
  focusLetter: string;
  tip: string;
  audioGuide: string;
}

const PHONICS_EXERCISES: PhonicsExercise[] = [
  {
    id: 'p1',
    word: 'الصِّدْقُ',
    category: 'الحروف المفخمة والصفير',
    focusLetter: 'ص',
    tip: 'اطبق لسانك واستعلِ بأقصى اللسان لنطق الصاد مفخمة دون ضم الشفتين.',
    audioGuide: 'الصِّدْقُ. الصاد حرف مفخم، والصِّدق منجاة.',
  },
  {
    id: 'p2',
    word: 'الضِّفْدَعُ',
    category: 'حرف الضاد (لغة الضاد)',
    focusLetter: 'ض',
    tip: 'يخرج من إحدى حافتي اللسان مع الأضراس العليا، وهو حرف مميز للعرب.',
    audioGuide: 'الضِّفْدَعُ. لغة الضاد الفصيحة.',
  },
  {
    id: 'p3',
    word: 'طَرِيقٌ',
    category: 'الطاء المفخمة والقلقلة',
    focusLetter: 'ط / ق',
    tip: 'فخم الطاء واجعل القاف ممتلئة بالصوت في آخر الكلمة.',
    audioGuide: 'طَرِيقٌ. طاء مفخمة وقاف رنانة.',
  },
  {
    id: 'p4',
    word: 'عُصْفُورٌ',
    category: 'حروف الحلق (العين)',
    focusLetter: 'ع',
    tip: 'أخرج العين من وسط الحلق بنعومة ووضوح دون تكلف.',
    audioGuide: 'عُصْفُورٌ. صوت العين الفصيح من وسط الحلق.',
  },
  {
    id: 'p5',
    word: 'الْحَمْدُ',
    category: 'حرف الحاء الصافي',
    focusLetter: 'ح',
    tip: 'الحاء حرف مهموس يخرج من وسط الحلق مصحوباً بجريان النفس اللطيف.',
    audioGuide: 'الْحَمْدُ للهِ رَبِّ الْعَالَمِينَ.',
  },
  {
    id: 'p6',
    word: 'الْقَلَمُ',
    category: 'أقصى اللسان (القاف)',
    focusLetter: 'ق',
    tip: 'يخرج من أقصى اللسان مع الحنك اللحمي بقوة وانفجار صوتي.',
    audioGuide: 'الْقَلَمُ. ن والقلم وما يسطرون.',
  },
  {
    id: 'p7',
    word: 'رَبَّنَا',
    category: 'تفخيم الراء المفتوحة',
    focusLetter: 'رَ',
    tip: 'الراء المفتوحة والمضمومة مفخمة، والراء المكسورة مرققة.',
    audioGuide: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً.',
  },
];

export const PronunciationLab: React.FC<PronunciationLabProps> = ({ onEarnStar }) => {
  const [selectedExercise, setSelectedExercise] = useState<PhonicsExercise>(PHONICS_EXERCISES[0]);
  const [customWord, setCustomWord] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [ratedStars, setRatedStars] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const currentWordToPractice = customWord.trim() || selectedExercise.word;

  // Clean up recording streams on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);

  // Play model pronunciation
  const playMasterPronunciation = () => {
    audioEngine.speak(currentWordToPractice);
  };

  // Start microphone recording
  const startRecording = async () => {
    setMicError(null);
    setRecordedAudioUrl(null);
    setRatedStars(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      // Set up real-time visualizer waveform
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      visualizeWaveform();

      mediaRecorder.start();
      setIsRecording(true);
      audioEngine.playClickSound();
    } catch (err: any) {
      console.warn('Microphone error:', err);
      setMicError('تعذر الوصول إلى الميكروفون. يرجى السماح بالإذن في المتصفح لتسجيل الصوت.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      audioEngine.playSuccessSound();
    }
  };

  // Waveform visualization loop
  const visualizeWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#0f172a' : '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;

        // Gradient color for waves
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, '#3b82f6');
        grad.addColorStop(1, '#ec4899');

        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }
    };

    draw();
  };

  // Play student's recorded audio
  const playRecordedAudio = () => {
    if (!recordedAudioUrl) return;
    const audio = new Audio(recordedAudioUrl);
    audio.play();
  };

  // Self-evaluation rating
  const handleRateSelf = (stars: number) => {
    setRatedStars(stars);
    audioEngine.playFanfare();
    if (stars === 3) {
      audioEngine.speak('ممتاز! نطق فصيح ومخارج حروف متقنة كالمحترفين!');
    } else {
      audioEngine.speak('أحسنت المحاولة! استمر في التدرب للوصول إلى النطق الأكمل.');
    }
    onEarnStar(stars * 2);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 dark:from-rose-900 dark:via-pink-900 dark:to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden transition-colors">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-white/10 backdrop-blur-xs px-3.5 py-1 rounded-full text-xs font-bold text-amber-200 mb-3 border border-white/20">
            <Mic className="w-4 h-4 text-amber-300" />
            <span>مختبر النطق الصوتي ومخارج الحروف الفصيحة</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
            تَدَرَّبْ عَلَى النُّطْقِ الصَّحِيحِ وَقَارِنْ صَوْتَكَ بِالْفَصَاحَةِ
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-pink-100 leading-relaxed max-w-2xl">
            استمع لأي كلمة بالتشكيل التام، سجّل صوتك عبر الميكروفون مع المخطط الصوتي التفاعلي، وقارن مخارج حروفك بنطق المعلم.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Side: Exercises List & Custom Word Input (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Custom Input */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>جرب نطق أي كلمة أو جملة من اختيارك:</span>
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customWord}
                onChange={(e) => setCustomWord(e.target.value)}
                placeholder="اكتب كلمة مشكولة مثل: الصِّدْقُ..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-750 focus:outline-hidden focus:ring-2 focus:ring-rose-400 placeholder-slate-400 dark:placeholder-slate-500"
              />
              {customWord && (
                <button
                  onClick={() => setCustomWord('')}
                  className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  مسح
                </button>
              )}
            </div>
          </div>

          {/* Phonics Categories & Exercises */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <span>تمارين مخارج الحروف الشائعة:</span>
            </h4>
            <div className="space-y-2.5">
              {PHONICS_EXERCISES.map((ex) => {
                const isSelected = selectedExercise.id === ex.id && !customWord;
                return (
                  <div
                    key={ex.id}
                    onClick={() => {
                      setSelectedExercise(ex);
                      setCustomWord('');
                      audioEngine.playClickSound();
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-800 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-900 dark:text-white">{ex.word}</span>
                        <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-md">
                          حرف ({ex.focusLetter})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{ex.category}</div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        audioEngine.speak(ex.audioGuide);
                      }}
                      className="p-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-300 transition shadow-2xs border border-slate-200 dark:border-slate-650"
                      title="استمع للمثال والتوجيه"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Recording Studio & Live Waveform (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 transition-colors">
          {/* Target Word Display */}
          <div className="text-center py-6 px-4 rounded-3xl bg-radial from-rose-50/60 to-slate-50 dark:from-slate-855 dark:to-slate-950 border-2 border-rose-100 dark:border-rose-900/40">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/70 px-3 py-1 rounded-full">
              الكلمة المحددة للتدريب
            </span>
            <div className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white my-4 tracking-wide">
              {currentWordToPractice}
            </div>

            {!customWord && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                💡 <span className="font-bold text-rose-800 dark:text-rose-300">توجيه المخرج:</span> {selectedExercise.tip}
              </p>
            )}

            {/* Model Voice Play Button */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={playMasterPronunciation}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center gap-2 shadow-md cursor-pointer transition active:scale-95"
              >
                <Volume2 className="w-4 h-4" />
                <span>استمع للنطق النموذجي الفصيح</span>
              </button>
            </div>
          </div>

          {/* Microphone Recording Studio */}
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-center space-y-4">
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5">
              <WaveformIcon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>مختبر تسجيل ومقارنة الصوت:</span>
            </h4>

            {/* Live Audio Waveform Canvas */}
            <div className="w-full h-24 rounded-xl bg-slate-900 overflow-hidden relative border border-slate-700 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={500}
                height={96}
                className="w-full h-full"
              />
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-900/60 backdrop-blur-2xs">
                  اضغط على زر التسجيل وتحدث في الميكروفون
                </div>
              )}
            </div>

            {/* Mic Error */}
            {micError && (
              <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{micError}</span>
              </div>
            )}

            {/* Record Trigger Button */}
            <div className="flex items-center justify-center gap-3">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm sm:text-base flex items-center gap-2 shadow-lg cursor-pointer transition active:scale-95 group"
                >
                  <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>سجل صوتك يا بطل</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm sm:text-base flex items-center gap-2 shadow-lg cursor-pointer transition animate-pulse"
                >
                  <MicOff className="w-5 h-5" />
                  <span>إيقاف التسجيل</span>
                </button>
              )}
            </div>

            {/* Recording Completed Controls */}
            {recordedAudioUrl && !isRecording && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={playRecordedAudio}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer transition"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>استمع لتسجيلك</span>
                  </button>

                  <button
                    onClick={playMasterPronunciation}
                    className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>صوت المعلم للمقارنة</span>
                  </button>
                </div>

                {/* Self-Rating Assessment */}
                <div className="bg-white dark:bg-slate-850 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-2">
                    قيّم نطقك مقارنة بالنطق الفصيح:
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3].map((starCount) => (
                      <button
                        key={starCount}
                        onClick={() => handleRateSelf(starCount)}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1 text-xs font-bold transition cursor-pointer ${
                          ratedStars === starCount
                            ? 'bg-amber-400 dark:bg-amber-500 text-amber-950 font-black border-amber-500 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        <span>{starCount === 3 ? 'فصيح ومتقن 100%' : starCount === 2 ? 'جيد جداً' : 'يحتاج تكرار'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
