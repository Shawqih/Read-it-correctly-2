import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '../../data/curriculumData';
import { Volume2, CheckCircle2, XCircle, Sparkles, X, ArrowLeft } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface QuizModalProps {
  title: string;
  badgeName: string;
  badgeIcon: string;
  questions: QuizQuestion[];
  onClose: () => void;
  onQuizCompleted: (score: number, total: number, perfect: boolean) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  title,
  badgeName,
  badgeIcon,
  questions,
  onClose,
  onQuizCompleted,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<Record<number, boolean>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [readingQuestion, setReadingQuestion] = useState(false);

  const currentQ = questions[currentIdx];
  const isAnswered = isAnswerSubmitted[currentIdx];
  const selectedOpt = selectedAnswers[currentIdx];

  // Read current question with Gemini 3.8 Flash TTS or Web Speech
  const readCurrentQuestion = () => {
    setReadingQuestion(true);
    const optionsText = currentQ.options.map((opt, i) => `الخيار ${i + 1}: ${opt}`).join('. ');
    audioEngine.speak(`السؤال: ${currentQ.question}. ${optionsText}`, {
      onEnd: () => setReadingQuestion(false),
      onError: () => setReadingQuestion(false),
    });
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;

    audioEngine.playClickSound();
    setSelectedAnswers({ ...selectedAnswers, [currentIdx]: index });
    setIsAnswerSubmitted({ ...isAnswerSubmitted, [currentIdx]: true });

    if (index === currentQ.correctIndex) {
      audioEngine.playSuccessSound();
    } else {
      audioEngine.playErrorSound();
    }
  };

  const handleNext = () => {
    audioEngine.stop();
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    // Calculate score
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const isPerfect = correctCount === questions.length;
    setQuizFinished(true);

    if (isPerfect) {
      // Trigger joyful celebration and fanfare with encouraging voice feedback
      audioEngine.playFanfare();
      triggerConfettiCelebration();
      const encouragement = `مَا شَاءَ اللهُ يَا بَطَل! لَقَدْ حَقَّقْتَ الدَّرَجَةَ الْكَامِلَةَ فِي اخْتِبَارِ «${title}»، وَتَمَّ مَنْحُكَ «${badgeName}» بِجَدَارَةٍ!`;
      audioEngine.playEncouragement('quiz', encouragement);
    } else {
      audioEngine.playSuccessSound();
      const pct = Math.round((correctCount / questions.length) * 100);
      if (pct >= 50) {
        audioEngine.playEncouragement('quiz', `أَحْسَنْتَ صُنْعاً يَا بَطَل! نَتِيجَةٌ طَيِّبَةٌ بِنِسْبَةِ ${pct} بِالْمِئَةِ، وَاصِلِ التَّدَرُّبَ لِتَحْقِيقِ الْعَلَامَةِ الْكَامِلَةِ!`);
      }
    }

    onQuizCompleted(correctCount, questions.length, isPerfect);
  };

  const triggerConfettiCelebration = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Score calculations
  const totalCorrect = questions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.correctIndex ? 1 : 0);
  }, 0);
  const percentage = Math.round((totalCorrect / questions.length) * 100);
  const isPerfectScore = percentage === 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden max-h-[90vh] overflow-y-auto transition-colors">
        {/* Close Button */}
        <button
          onClick={() => {
            audioEngine.stop();
            onClose();
          }}
          className="absolute top-5 left-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!quizFinished ? (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                اختبار تقييمي ذكي
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-2">
                {title}
              </h3>
              <div className="flex items-center justify-center gap-2 mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>السؤال {currentIdx + 1} من {questions.length}</span>
                <span>•</span>
                <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 mb-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 leading-relaxed">
                  {currentQ.question}
                </p>
                <button
                  onClick={readCurrentQuestion}
                  className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                    readingQuestion
                      ? 'bg-blue-600 text-white animate-pulse'
                      : 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-650 border border-slate-200 dark:border-slate-600 shadow-xs'
                  }`}
                  title="استمع للسؤال صوتياً"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Options List */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedOpt === optIdx;
                const isCorrect = currentQ.correctIndex === optIdx;

                let btnStyle = 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
                let icon = null;

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-800 font-black';
                    icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-50 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 border-rose-500 ring-2 ring-rose-300 dark:ring-rose-800 font-bold';
                    icon = <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
                  } else {
                    btnStyle = 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 opacity-60';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isAnswered}
                    className={`w-full text-right p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer text-sm sm:text-base font-bold shadow-xs ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answer */}
            {isAnswered && (
              <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 mb-5 text-xs sm:text-sm text-blue-900 dark:text-blue-200 animate-fadeIn">
                <span className="font-bold">توضيح المعلم: </span>
                <span>{currentQ.explanation}</span>
              </div>
            )}

            {/* Next Question / Finish Button */}
            {isAnswered && (
              <button
                onClick={handleNext}
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md cursor-pointer transition"
              >
                <span>{currentIdx < questions.length - 1 ? 'السؤال التالي' : 'إنهاء الاختبار وعرض النتيجة'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          /* Quiz Results & Festive 100% Celebration */
          <div className="text-center py-4 space-y-5 animate-fadeIn">
            {isPerfectScore ? (
              <div className="space-y-4">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-radial from-amber-400 to-amber-600 text-white flex items-center justify-center text-5xl shadow-xl animate-bounce">
                  {badgeIcon}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 px-3.5 py-1 rounded-full text-xs font-black mb-2 border border-amber-300 dark:border-amber-800">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>مبارك! حققت الدرجة الكاملة 100%</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    أحسنت يا بطل القراءة!
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                    تم منحك وسام الاستحقاق الخاص:
                  </p>
                  <div className="text-lg font-black text-amber-700 dark:text-amber-400 mt-1">
                    « {badgeName} »
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-4xl">
                  👍
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  محاولة رائعة ومتميزة!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  لقد أجبت بشكل صحيح على {totalCorrect} من أصل {questions.length} أسئلة بنسبة ({percentage}%).
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                  كرر المحاولة لتحقيق 100% والفوز بالوسام الذهبي والاحتفالية المبهجة!
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setIsAnswerSubmitted({});
                  setCurrentIdx(0);
                  setQuizFinished(false);
                  audioEngine.playClickSound();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold transition cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={() => {
                  audioEngine.stop();
                  onClose();
                }}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black transition cursor-pointer shadow-md"
              >
                متابعة التعلم
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
