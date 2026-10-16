import React, { useState } from 'react';
import { ARABIC_ALPHABET, AlphabetLetter, LetterVowel } from '../../data/alphabetData';
import { AlphabetTracingCanvas } from './AlphabetTracingCanvas';
import { Volume2, Sparkles, BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface AlphabetCornerProps {
  onEarnStar: () => void;
}

export const AlphabetCorner: React.FC<AlphabetCornerProps> = ({ onEarnStar }) => {
  const [selectedLetter, setSelectedLetter] = useState<AlphabetLetter>(ARABIC_ALPHABET[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);

  const currentIndex = ARABIC_ALPHABET.findIndex((l) => l.id === selectedLetter.id);

  const goToNextLetter = () => {
    const nextIdx = (currentIndex + 1) % ARABIC_ALPHABET.length;
    setSelectedLetter(ARABIC_ALPHABET[nextIdx]);
    audioEngine.playClickSound();
  };

  const goToPrevLetter = () => {
    const prevIdx = (currentIndex - 1 + ARABIC_ALPHABET.length) % ARABIC_ALPHABET.length;
    setSelectedLetter(ARABIC_ALPHABET[prevIdx]);
    audioEngine.playClickSound();
  };

  const playVowelAudio = (vowelKey: string, vowelData: LetterVowel) => {
    setIsPlayingAudio(vowelKey);
    audioEngine.speak(
      `حرف ${selectedLetter.name} مع ${vowelData.label}. ${vowelData.pronunciationText}. مثال: ${vowelData.exampleWord}`,
      {
        onEnd: () => setIsPlayingAudio(null),
        onError: () => setIsPlayingAudio(null),
      }
    );
  };

  const playWordAudio = (word: string, meaning: string) => {
    audioEngine.speak(`${word}. ${meaning}`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 dark:from-blue-900 dark:via-indigo-900 dark:to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden transition-colors">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-white/10 backdrop-blur-xs px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold text-amber-200 mb-3 border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>ركن الحروف الهجائية الثري والتفاعلي</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
            تَعَلَّمْ رَسْمَ الْحُرُوفِ وَانْطِقْهَا بِالْحَرَكَاتِ الثَّلَاثِ
          </h2>
          <p className="mt-2 text-sm sm:text-base text-blue-50 dark:text-blue-100 leading-relaxed max-w-2xl">
            تدرّب بأصابعك على لوحة الرسم التفاعلية، واستمع إلى النطق الصوتي الفصيح بالفتحة والضمة والكسرة والسكون مع الأمثلة المصورة.
          </p>
        </div>

        {/* Ambient floating letters */}
        <div className="absolute -bottom-6 -left-6 text-9xl font-black text-white/10 select-none pointer-events-none">
          {selectedLetter.char}
        </div>
      </div>

      {/* Letters Horizontal / Grid Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span>اختر الحرف للبدء (28 حرفاً هجائياً):</span>
          </span>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900/60">
            الحرف {currentIndex + 1} من 28
          </span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 sm:gap-2.5">
          {ARABIC_ALPHABET.map((item) => {
            const isSelected = item.id === selectedLetter.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedLetter(item);
                  audioEngine.playClickSound();
                  audioEngine.speak(`حرف ${item.name}`);
                }}
                className={`flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl font-black transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md scale-105 ring-3 ring-blue-300 dark:ring-blue-800'
                    : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
              >
                <span className="text-xl sm:text-2xl leading-none mb-1">{item.char}</span>
                <span className="text-[10px] font-bold opacity-80">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Selected Letter Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Side: Vowels Cards & Sample Words (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Letter Info Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-5xl sm:text-6xl font-black shadow-md">
                {selectedLetter.char}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    حَرْفُ {selectedLetter.name}
                  </h3>
                  <button
                    onClick={() => audioEngine.speak(`حرف ${selectedLetter.name}`)}
                    className="p-2 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 cursor-pointer transition"
                    title="استمع لاسم الحرف"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                {/* Positions in word */}
                <div className="flex items-center gap-3 mt-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span>أول: <span className="text-blue-700 dark:text-blue-400 text-sm font-black">{selectedLetter.initial}</span></span>
                  <span>وسط: <span className="text-blue-700 dark:text-blue-400 text-sm font-black">{selectedLetter.medial}</span></span>
                  <span>آخر: <span className="text-blue-700 dark:text-blue-400 text-sm font-black">{selectedLetter.final}</span></span>
                </div>
              </div>
            </div>

            {/* Prev / Next Letter Nav */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevLetter}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition flex items-center gap-1 text-xs cursor-pointer border border-slate-200 dark:border-slate-700"
                title="الحرف السابق"
              >
                <ArrowRight className="w-4 h-4" />
                <span className="hidden sm:inline">السابق</span>
              </button>
              <button
                onClick={goToNextLetter}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1 text-xs cursor-pointer shadow-xs"
                title="الحرف التالي"
              >
                <span className="hidden sm:inline">التالي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Vowels Cards (الفتحة، الضمة، الكسرة، السكون) */}
          <div>
            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span>نطق الحرف بالحركات ومخارج الأصوات:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Fatha */}
              <div className="bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-4 hover:border-amber-400 transition shadow-xs group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2.5 py-0.5 rounded-md">
                    فَتْحَة ( َ )
                  </span>
                  <button
                    onClick={() => playVowelAudio('fatha', selectedLetter.vowels.fatha)}
                    className="p-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white transition cursor-pointer shadow-xs group-hover:scale-105"
                    title="استمع للنطق بالفتحة"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3 my-2.5">
                  <span className="text-4xl font-black text-amber-900 dark:text-amber-200">
                    {selectedLetter.vowels.fatha.charWithVowel}
                  </span>
                  <div className="text-2xl">{selectedLetter.vowels.fatha.exampleIcon}</div>
                  <div>
                    <div className="text-base font-black text-slate-900 dark:text-slate-100">
                      {selectedLetter.vowels.fatha.exampleWord}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {selectedLetter.vowels.fatha.meaning}
                    </div>
                  </div>
                </div>
              </div>

              {/* Damma */}
              <div className="bg-blue-50/70 dark:bg-blue-950/30 border-2 border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-4 hover:border-blue-400 transition shadow-xs group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-2.5 py-0.5 rounded-md">
                    ضَمَّة ( ُ )
                  </span>
                  <button
                    onClick={() => playVowelAudio('damma', selectedLetter.vowels.damma)}
                    className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition cursor-pointer shadow-xs group-hover:scale-105"
                    title="استمع للنطق بالضمة"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3 my-2.5">
                  <span className="text-4xl font-black text-blue-900 dark:text-blue-200">
                    {selectedLetter.vowels.damma.charWithVowel}
                  </span>
                  <div className="text-2xl">{selectedLetter.vowels.damma.exampleIcon}</div>
                  <div>
                    <div className="text-base font-black text-slate-900 dark:text-slate-100">
                      {selectedLetter.vowels.damma.exampleWord}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {selectedLetter.vowels.damma.meaning}
                    </div>
                  </div>
                </div>
              </div>

              {/* Kasra */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-200/80 dark:border-emerald-900/60 rounded-2xl p-4 hover:border-emerald-400 transition shadow-xs group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-0.5 rounded-md">
                    كَسْرَة ( ِ )
                  </span>
                  <button
                    onClick={() => playVowelAudio('kasra', selectedLetter.vowels.kasra)}
                    className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition cursor-pointer shadow-xs group-hover:scale-105"
                    title="استمع للنطق بالكسرة"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3 my-2.5">
                  <span className="text-4xl font-black text-emerald-900 dark:text-emerald-200">
                    {selectedLetter.vowels.kasra.charWithVowel}
                  </span>
                  <div className="text-2xl">{selectedLetter.vowels.kasra.exampleIcon}</div>
                  <div>
                    <div className="text-base font-black text-slate-900 dark:text-slate-100">
                      {selectedLetter.vowels.kasra.exampleWord}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {selectedLetter.vowels.kasra.meaning}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sukoon */}
              <div className="bg-purple-50/70 dark:bg-purple-950/30 border-2 border-purple-200/80 dark:border-purple-900/60 rounded-2xl p-4 hover:border-purple-400 transition shadow-xs group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-2.5 py-0.5 rounded-md">
                    سُكُون ( ْ )
                  </span>
                  <button
                    onClick={() => playVowelAudio('sukoon', selectedLetter.vowels.sukoon)}
                    className="p-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white transition cursor-pointer shadow-xs group-hover:scale-105"
                    title="استمع للنطق بالسكون"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3 my-2.5">
                  <span className="text-4xl font-black text-purple-900 dark:text-purple-200">
                    {selectedLetter.vowels.sukoon.charWithVowel}
                  </span>
                  <div className="text-2xl">{selectedLetter.vowels.sukoon.exampleIcon}</div>
                  <div>
                    <div className="text-base font-black text-slate-900 dark:text-slate-100">
                      {selectedLetter.vowels.sukoon.exampleWord}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {selectedLetter.vowels.sukoon.meaning}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Words Gallery */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>كلمات نموذجية تبدأ أو تحتوي على حرف ({selectedLetter.name}):</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selectedLetter.sampleWords.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => playWordAudio(item.word, item.meaning)}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="text-sm font-black text-slate-900 dark:text-slate-100">{item.word}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.meaning}</div>
                    </div>
                  </div>
                  <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400 opacity-60 hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Tracing Canvas (5 cols) */}
        <div className="lg:col-span-5">
          <AlphabetTracingCanvas
            letterChar={selectedLetter.char}
            letterName={selectedLetter.name}
            tracingHint={selectedLetter.tracingHint}
            onDrawCompleted={onEarnStar}
          />
        </div>
      </div>
    </div>
  );
};
