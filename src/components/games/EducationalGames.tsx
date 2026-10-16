import React, { useState, useEffect } from 'react';
import { Gamepad2, RotateCcw, Volume2 } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';
import confetti from 'canvas-confetti';

interface EducationalGamesProps {
  onEarnStar: (stars?: number) => void;
}

export const EducationalGames: React.FC<EducationalGamesProps> = ({ onEarnStar }) => {
  const [activeGame, setActiveGame] = useState<'memory' | 'vowels' | 'sentence'>('memory');

  // ================= GAME 1: MEMORY MATCH =================
  const MEMORY_CARDS = [
    { id: 1, pairId: 'a', content: 'أَ', label: 'حرف الألف' },
    { id: 2, pairId: 'a', content: 'أَسَدٌ 🦁', label: 'أسد' },
    { id: 3, pairId: 'b', content: 'بَ', label: 'حرف الباء' },
    { id: 4, pairId: 'b', content: 'بَطَّةٌ 🦆', label: 'بطة' },
    { id: 5, pairId: 't', content: 'تُ', label: 'حرف التاء' },
    { id: 6, pairId: 't', content: 'تُفَّاحٌ 🍎', label: 'تفاح' },
    { id: 7, pairId: 'j', content: 'جَ', label: 'حرف الجيم' },
    { id: 8, pairId: 'j', content: 'جَمَلٌ 🐪', label: 'جمل' },
    { id: 9, pairId: 'sh', content: 'شَ', label: 'حرف الشين' },
    { id: 10, pairId: 'sh', content: 'شَمْسٌ ☀️', label: 'شمس' },
    { id: 11, pairId: 'q', content: 'قَ', label: 'حرف القاف' },
    { id: 12, pairId: 'q', content: 'قَلَمٌ ✏️', label: 'قلم' },
  ];

  const [cards, setCards] = useState<any[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  const initMemoryGame = () => {
    const shuffled = [...MEMORY_CARDS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
  };

  useEffect(() => {
    initMemoryGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || flippedIndices.includes(index)) return;
    const clickedCard = cards[index];
    if (matchedPairs.includes(clickedCard.pairId)) return;

    audioEngine.playClickSound();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.pairId === secondCard.pairId) {
        // Matched!
        audioEngine.playSuccessSound();
        audioEngine.speak(`${firstCard.label} مع ${secondCard.label}`);
        setMatchedPairs((prev) => {
          const updated = [...prev, firstCard.pairId];
          if (updated.length === MEMORY_CARDS.length / 2) {
            // Victory
            audioEngine.playFanfare();
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            onEarnStar(15);
            audioEngine.playEncouragement(
              'game',
              'مَا شَاءَ اللهُ يَا بَطَل! لَقَدْ حَلَلْتَ لُعْبَةَ الذَّاكِرَةِ بِنَجَاحٍ بَاهِرٍ وَحَصَلْتَ عَلَى خَمْسَ عَشْرَةَ نَجْمَةً ذَهَبِيَّةً!'
            );
          }
          return updated;
        });
        setFlippedIndices([]);
      } else {
        // Not a match
        setTimeout(() => {
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  // ================= GAME 2: VOWEL MATCH =================
  const VOWEL_QUESTIONS = [
    { word: 'كَتَبَ', targetChar: 'كَـ', correctVowel: 'فَتْحَة ( َ )', options: ['فَتْحَة ( َ )', 'ضَمَّة ( ُ )', 'كَسْرَة ( ِ )'] },
    { word: 'كُتُبٌ', targetChar: 'كُـ', correctVowel: 'ضَمَّة ( ُ )', options: ['فَتْحَة ( َ )', 'ضَمَّة ( ُ )', 'كَسْرَة ( ِ )'] },
    { word: 'كِتَابٌ', targetChar: 'كِـ', correctVowel: 'كَسْرَة ( ِ )', options: ['فَتْحَة ( َ )', 'ضَمَّة ( ُ )', 'كَسْرَة ( ِ )'] },
    { word: 'شَمْسٌ', targetChar: 'ـمْـ', correctVowel: 'سُكُون ( ْ )', options: ['سُكُون ( ْ )', 'فَتْحَة ( َ )', 'ضَمَّة ( ُ )'] },
    { word: 'قَلَمٌ', targetChar: 'ـمٌ', correctVowel: 'تَنْوِين ضَمّ ( ٌ )', options: ['تَنْوِين ضَمّ ( ٌ )', 'تَنْوِين فَتْح ( ً )', 'سُكُون ( ْ )'] },
  ];

  const [vowelIdx, setVowelIdx] = useState(0);
  const [vowelFeedback, setVowelFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handleVowelAnswer = (opt: string) => {
    const current = VOWEL_QUESTIONS[vowelIdx];
    if (opt === current.correctVowel) {
      audioEngine.playSuccessSound();
      setVowelFeedback('correct');
      audioEngine.speak(`صحيح! ${current.word} بحركة ${current.correctVowel}`);

      setTimeout(() => {
        setVowelFeedback(null);
        if (vowelIdx < VOWEL_QUESTIONS.length - 1) {
          setVowelIdx((i) => i + 1);
        } else {
          // Finished
          audioEngine.playFanfare();
          confetti({ particleCount: 70, spread: 60 });
          onEarnStar(10);
          audioEngine.playEncouragement(
            'game',
            'فَوْزٌ رَائِعٌ وَمُسْتَحَقٌّ! أَتْقَنْتَ جَمِيعَ تَحَدِّيَاتِ الْحَرَكَاتِ الصَّوْتِيَّةِ بِكُلِّ فَصَاحَةٍ وَذَكَاءٍ!'
          );
        }
      }, 1200);
    } else {
      audioEngine.playErrorSound();
      setVowelFeedback('wrong');
    }
  };

  // ================= GAME 3: SENTENCE BUILDER =================
  const SENTENCE_LEVELS = [
    { words: ['الْعِلْمُ', 'نُورٌ', 'يُضِيءُ', 'الْعُقُولَ'], correct: 'الْعِلْمُ نُورٌ يُضِيءُ الْعُقُولَ' },
    { words: ['قَرَأَ', 'التِّلْمِيذُ', 'قِصَّةً', 'مُفِيدَةً'], correct: 'قَرَأَ التِّلْمِيذُ قِصَّةً مُفِيدَةً' },
    { words: ['الْأَخْلَاقُ', 'الْفَاضِلَةُ', 'تَبْنِي', 'الْأَوْطَانَ'], correct: 'الْأَخْلَاقُ الْفَاضِلَةُ تَبْنِي الْأَوْطَانَ' },
  ];

  const [sentenceLevel, setSentenceLevel] = useState(0);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [chosenWords, setChosenWords] = useState<string[]>([]);
  const [isSentenceSuccess, setIsSentenceSuccess] = useState(false);

  useEffect(() => {
    const level = SENTENCE_LEVELS[sentenceLevel];
    if (level) {
      setAvailableWords([...level.words].sort(() => Math.random() - 0.5));
      setChosenWords([]);
      setIsSentenceSuccess(false);
    }
  }, [sentenceLevel]);

  const addWordToSentence = (word: string, index: number) => {
    audioEngine.playClickSound();
    audioEngine.speak(word);
    const newAvail = [...availableWords];
    newAvail.splice(index, 1);
    const newChosen = [...chosenWords, word];
    setAvailableWords(newAvail);
    setChosenWords(newChosen);

    // Check if sentence complete
    if (newChosen.length === SENTENCE_LEVELS[sentenceLevel].words.length) {
      const constructed = newChosen.join(' ');
      if (constructed === SENTENCE_LEVELS[sentenceLevel].correct) {
        setIsSentenceSuccess(true);
        audioEngine.playSuccessSound();
        onEarnStar(5);

        if (sentenceLevel === SENTENCE_LEVELS.length - 1) {
          audioEngine.playFanfare();
          confetti({ particleCount: 70, spread: 60 });
          audioEngine.playEncouragement(
            'game',
            `مُمْتَازٌ جِدّاً! كَوَّنْتَ الْجُمْلَةَ: «${constructed}»، وَأَنْهَيْتَ كَافَّةَ مَرَاحِلِ تَرْكِيبِ الْجُمَلِ الْفَصِيحَةِ بِجَدَارَةٍ!`
          );
        } else {
          audioEngine.playEncouragement(
            'game',
            `أَحْسَنْتَ صُنْعاً! جُمْلَةٌ فَصِيحَةٌ: «${constructed}»! اضْغَطْ عَلَى زِرِّ الْجُمْلَةِ التَّالِيَةِ لِمُوَاصَلَةِ التَّحَدِّي.`
          );
        }
      } else {
        audioEngine.playErrorSound();
      }
    }
  };

  const resetSentenceBuilder = () => {
    const level = SENTENCE_LEVELS[sentenceLevel];
    setAvailableWords([...level.words].sort(() => Math.random() - 0.5));
    setChosenWords([]);
    setIsSentenceSuccess(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 dark:from-purple-950 dark:via-indigo-950 dark:to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden transition-colors">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-white/10 backdrop-blur-xs px-3.5 py-1 rounded-full text-xs font-bold text-amber-200 mb-3 border border-white/20">
            <Gamepad2 className="w-4 h-4 text-amber-300" />
            <span>الألعاب اللغوية التفاعلية الذكية</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
            الْعَبْ، تَحَدَّ، وَتَعَلَّمْ بِكُلِّ مَرَحٍ وَإِتْقَانٍ
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-purple-100 leading-relaxed max-w-2xl">
            ألعاب ممتعة مصممة لترسيخ الذاكرة البصرية، ومطابقة الحركات الصوتية، وتكوين الجمل الفصيحة في الوضعين النهاري والليلي.
          </p>
        </div>
      </div>

      {/* Game Selector Buttons */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        <button
          onClick={() => {
            setActiveGame('memory');
            audioEngine.playClickSound();
          }}
          className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 shadow-xs ${
            activeGame === 'memory'
              ? 'bg-blue-600 text-white ring-3 ring-blue-300 dark:ring-blue-800'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <span>🧠</span>
          <span>لعبة الذاكرة اللغوية</span>
        </button>

        <button
          onClick={() => {
            setActiveGame('vowels');
            audioEngine.playClickSound();
          }}
          className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 shadow-xs ${
            activeGame === 'vowels'
              ? 'bg-blue-600 text-white ring-3 ring-blue-300 dark:ring-blue-800'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <span>🎯</span>
          <span>مطابقة الحركات والكلمات</span>
        </button>

        <button
          onClick={() => {
            setActiveGame('sentence');
            audioEngine.playClickSound();
          }}
          className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 shadow-xs ${
            activeGame === 'sentence'
              ? 'bg-blue-600 text-white ring-3 ring-blue-300 dark:ring-blue-800'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <span>🧩</span>
          <span>منجم تركيب الجمل</span>
        </button>
      </div>

      {/* ================= GAME 1 DISPLAY: MEMORY MATCH ================= */}
      {activeGame === 'memory' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs max-w-3xl mx-auto transition-colors">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>لعبة الذاكرة اللغوية (طابق الحرف مع الكلمة)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                اقلب البطاقات واعثر على الحرف وما يناسبه من الصور والكلمات.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                الحركات: {moves}
              </span>
              <button
                onClick={initMemoryGame}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                title="إعادة بدء اللعبة"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
            {cards.map((card, idx) => {
              const isFlipped = flippedIndices.includes(idx) || matchedPairs.includes(card.pairId);
              const isMatched = matchedPairs.includes(card.pairId);

              return (
                <div
                  key={idx}
                  onClick={() => handleCardClick(idx)}
                  className={`h-28 sm:h-32 rounded-2xl border-2 flex items-center justify-center p-3 text-center cursor-pointer select-none transition-all duration-300 ${
                    isFlipped
                      ? isMatched
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200 scale-95 shadow-xs'
                        : 'bg-blue-50 dark:bg-slate-800 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-200 shadow-md'
                      : 'bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-indigo-800 dark:to-blue-900 border-blue-400 dark:border-blue-700 hover:scale-102 shadow-sm text-white'
                  }`}
                >
                  {isFlipped ? (
                    <div className="animate-fadeIn">
                      <div className="text-2xl sm:text-3xl font-black mb-1">{card.content}</div>
                      <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{card.label}</div>
                    </div>
                  ) : (
                    <div className="text-3xl opacity-75">✨</div>
                  )}
                </div>
              );
            })}
          </div>

          {matchedPairs.length === MEMORY_CARDS.length / 2 && (
            <div className="mt-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-center animate-fadeIn">
              <p className="text-base font-black text-amber-900 dark:text-amber-200">
                🎉 رائع جداً! أنهيت لعبة الذاكرة بنجاح وحصلت على 15 نجمة ذهبية!
              </p>
            </div>
          )}
        </div>
      )}

      {/* ================= GAME 2 DISPLAY: VOWEL MATCH ================= */}
      {activeGame === 'vowels' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl mx-auto text-center transition-colors">
          <div className="mb-6">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              تحدي الحركات الصوتية ({vowelIdx + 1} من {VOWEL_QUESTIONS.length})
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">
              ما هي حركة الحرف المشار إليه في الكلمة؟
            </h3>
          </div>

          {/* Word Display */}
          <div className="my-8 p-6 rounded-3xl bg-radial from-slate-50 to-blue-50/50 dark:from-slate-855 dark:to-slate-900 border-2 border-dashed border-blue-200 dark:border-blue-900/60">
            <div className="text-5xl sm:text-6xl font-black text-blue-900 dark:text-blue-300 mb-2">
              {VOWEL_QUESTIONS[vowelIdx].word}
            </div>
            <div className="text-sm font-bold text-slate-600 dark:text-slate-400">
              الحرف المستهدف: <span className="text-blue-700 dark:text-blue-400 text-xl font-black">{VOWEL_QUESTIONS[vowelIdx].targetChar}</span>
            </div>
            <button
              onClick={() => audioEngine.speak(VOWEL_QUESTIONS[vowelIdx].word)}
              className="mt-3 p-2 rounded-full bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 shadow-xs cursor-pointer inline-flex items-center gap-1 text-xs font-bold border border-slate-200 dark:border-slate-700"
            >
              <Volume2 className="w-4 h-4" />
              <span>استمع لنطق الكلمة</span>
            </button>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {VOWEL_QUESTIONS[vowelIdx].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleVowelAnswer(opt)}
                className="py-4 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-600 font-black text-sm sm:text-base transition cursor-pointer shadow-xs"
              >
                {opt}
              </button>
            ))}
          </div>

          {vowelFeedback === 'correct' && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 font-bold text-sm animate-fadeIn">
              ✓ إجابة ممتازة وصحيحة!
            </div>
          )}
          {vowelFeedback === 'wrong' && (
            <div className="mt-4 p-3 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 font-bold text-sm animate-fadeIn">
              ✕ حاول مجدداً وركز في صوت النطق!
            </div>
          )}
        </div>
      )}

      {/* ================= GAME 3 DISPLAY: SENTENCE BUILDER ================= */}
      {activeGame === 'sentence' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl mx-auto transition-colors">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                منجم تركيب الجمل الفصيحة
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                اضغط على الكلمات بالترتيب الصحيح لتكوين جملة عربية مفيدة.
              </p>
            </div>
            <button
              onClick={resetSentenceBuilder}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer border border-slate-200 dark:border-slate-700"
              title="إعادة المحاولة"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Target Sentence Area */}
          <div className="min-h-28 rounded-2xl bg-slate-50 dark:bg-slate-850 border-2 border-dashed border-slate-300 dark:border-slate-700 p-4 flex flex-wrap items-center justify-center gap-2 mb-6 shadow-inner">
            {chosenWords.length === 0 ? (
              <span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500">
                انقر على الكلمات المتاحة بالأسفل لتضعها هنا بالترتيب
              </span>
            ) : (
              chosenWords.map((word, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-black text-base shadow-sm animate-fadeIn"
                >
                  {word}
                </span>
              ))
            )}
          </div>

          {/* Available Scrambled Words */}
          <div className="space-y-2 mb-6">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">الكلمات المتاحة:</span>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {availableWords.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => addWordToSentence(word, idx)}
                  className="px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 font-black text-sm sm:text-base transition cursor-pointer shadow-xs active:scale-95"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback & Next */}
          {isSentenceSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-center animate-fadeIn space-y-3">
              <p className="text-base font-black text-emerald-900 dark:text-emerald-200">
                ✨ أحسنت! كونت الجملة الصحيحة بنجاح فائق!
              </p>
              {sentenceLevel < SENTENCE_LEVELS.length - 1 && (
                <button
                  onClick={() => setSentenceLevel((lvl) => lvl + 1)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm cursor-pointer transition"
                >
                  الجملة التالية →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
