import React, { useState } from 'react';
import {
  CURRICULUM_GRADES,
  CURRICULUM_LESSONS,
  CurriculumLesson,
} from '../../data/curriculumData';
import { QuizModal } from '../quiz/QuizModal';
import {
  Layers,
  CheckCircle,
  Play,
  Volume2,
  Award,
  Sparkles,
  BookOpen,
  ChevronLeft,
  Check,
  ListOrdered,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface CurriculumViewProps {
  completedLessons: string[];
  onCompleteLesson: (lessonId: string, badgeName: string, badgeIcon: string, grade: number) => void;
  onEarnStar: (stars?: number) => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  completedLessons,
  onCompleteLesson,
  onEarnStar,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [activeLesson, setActiveLesson] = useState<CurriculumLesson | null>(null);
  const [activeQuizLesson, setActiveQuizLesson] = useState<CurriculumLesson | null>(null);
  const [completedActivities, setCompletedActivities] = useState<Record<string, string[]>>({});

  const gradeInfo = CURRICULUM_GRADES.find((g) => g.grade === selectedGrade)!;
  const gradeLessons = CURRICULUM_LESSONS.filter((l) => l.grade === selectedGrade);

  const isCompleted = (lessonId: string) => completedLessons.includes(lessonId);

  // Play audio for activity item and track sub-lesson completion with voice encouragement
  const handlePlayActivityAudio = (lessonId: string, actId: string, audioText: string) => {
    setCompletedActivities((prev) => {
      const currentList = prev[lessonId] || [];
      const updatedList = currentList.includes(actId) ? currentList : [...currentList, actId];
      if (!currentList.includes(actId)) {
        onEarnStar(1);
      }

      const currentLesson = CURRICULUM_LESSONS.find((l) => l.id === lessonId);
      const totalActivities = currentLesson?.activities.length || 5;

      // If the child just completed all sub-lessons for this unit
      if (updatedList.length === totalActivities && currentList.length < totalActivities) {
        audioEngine.speak(audioText, {
          onEnd: () => {
            audioEngine.playSuccessSound();
            audioEngine.playEncouragement(
              'lesson',
              `أَحْسَنْتَ يَا بَطَل! لَقَدْ أَتْمَمْتَ كَافَّةَ الدُّرُوسِ الْفَرْعِيَّةِ الْخَمْسَةِ لِدَرْسِ «${currentLesson?.title || ''}» بِنَجَاحٍ، أَنْتَ الْآنَ مُسْتَعِدٌّ لِخَوْضِ الِاخْتِبَارِ التَّقْيِيمِيِّ!`
            );
          },
        });
      } else {
        audioEngine.speak(audioText);
      }

      return {
        ...prev,
        [lessonId]: updatedList,
      };
    });
  };

  const handleLessonQuizCompleted = (score: number, total: number, perfect: boolean) => {
    if (activeQuizLesson) {
      if (perfect) {
        onCompleteLesson(activeQuizLesson.id, activeQuizLesson.badgeName, activeQuizLesson.badgeIcon, activeQuizLesson.grade);
        onEarnStar(10);
      } else {
        onEarnStar(3);
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Grade Selector Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>المناهج والوحدات الدراسية المعتمدة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {gradeInfo.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {gradeInfo.desc} • <span className="font-bold text-blue-700 dark:text-blue-400">5 دروس فرعية متدرجة لكل درس رئيسي</span> لتعزيز القراءة والتهجئة بتدرج منطقي ميسر
            </p>
          </div>

          {/* Grade Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {CURRICULUM_GRADES.map((g) => {
              const isSelected = selectedGrade === g.grade;
              return (
                <button
                  key={g.grade}
                  onClick={() => {
                    setSelectedGrade(g.grade);
                    setActiveLesson(null);
                    audioEngine.playClickSound();
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition cursor-pointer select-none ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  الصف {g.grade}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lessons List in the Grade */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gradeLessons.map((lesson, idx) => {
            const completed = isCompleted(lesson.id);
            const lessonCompletedActs = completedActivities[lesson.id] || [];
            const subLessonsCount = lesson.activities.length; // Exactly 5 sub-lessons

            return (
              <div
                key={lesson.id}
                onClick={() => {
                  setActiveLesson(lesson);
                  audioEngine.playClickSound();
                }}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group shadow-xs ${
                  completed
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 hover:border-emerald-500'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{lesson.icon}</span>
                    <div className="flex items-center gap-1.5">
                      {/* Sub-lessons badge: 5 دروس فرعية */}
                      <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/60 flex items-center gap-1">
                        <ListOrdered className="w-3 h-3" />
                        <span>{subLessonsCount} دروس فرعية</span>
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {lesson.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    الدرس {idx + 1}: {lesson.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {lesson.objective}
                  </p>

                  {/* Sub-lessons progress indicator */}
                  <div className="mt-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl p-2 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <span>محتوى الدرس:</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {completed ? '5 / 5 مكتملة' : `${lessonCompletedActs.length} من ${subLessonsCount} منجزة`}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {completed ? (
                      <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>مكتمل ومتقن</span>
                      </span>
                    ) : (
                      <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Play className="w-3.5 h-3.5 fill-blue-600 dark:fill-blue-400" />
                        <span>ابدأ الـ {subLessonsCount} دروس</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60">
                    <span>{lesson.badgeIcon}</span>
                    <span>{lesson.badgeName}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lesson Details Modal / Expanded View */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl">{activeLesson.icon}</span>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                    {activeLesson.gradeTitle} • {activeLesson.category}
                  </span>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span>5 دروس فرعية متدرجة</span>
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {activeLesson.title}
                </h3>
              </div>

              <button
                onClick={() => {
                  audioEngine.stop();
                  setActiveLesson(null);
                }}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Lesson Rule & Explanation */}
            <div className="my-5 bg-gradient-to-r from-blue-50 to-indigo-50/70 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-blue-900 dark:text-blue-300 flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>القاعدة والشرح الصوتي للدرس:</span>
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {activeLesson.ruleExplanation}
                  </p>
                </div>
                <button
                  onClick={() => audioEngine.speak(`${activeLesson.title}. ${activeLesson.ruleExplanation}`)}
                  className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer transition shrink-0"
                  title="استمع لشرح الدرس"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 5 Sub-Lessons Container */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>الدروس الفرعية التفاعلية (5 دروس فرعية متدرجة):</span>
                </h4>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {((completedActivities[activeLesson.id] || []).length)} من 5 مكتملة
                </span>
              </div>

              {activeLesson.activities.map((act, actIdx) => {
                const isActDone = (completedActivities[activeLesson.id] || []).includes(act.id);
                return (
                  <div
                    key={act.id}
                    className={`border-2 rounded-2xl p-4.5 transition-all ${
                      isActDone
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-300 dark:border-emerald-800/50'
                        : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          isActDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                        }`}>
                          {isActDone ? <Check className="w-3.5 h-3.5" /> : actIdx + 1}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
                          {act.title}
                        </span>
                      </div>
                      <button
                        onClick={() => handlePlayActivityAudio(activeLesson.id, act.id, act.audioText)}
                        className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition flex items-center gap-1 text-xs font-bold cursor-pointer"
                        title="استمع للدرس الفرعي"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span className="hidden sm:inline">استمع للنطق</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{act.instruction}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {act.content.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          onClick={() => {
                            audioEngine.speak(item);
                            handlePlayActivityAudio(activeLesson.id, act.id, item);
                          }}
                          className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 font-bold text-sm text-slate-900 dark:text-slate-100 cursor-pointer flex items-center justify-between hover:bg-blue-50/50 dark:hover:bg-slate-750 transition"
                        >
                          <span>{item}</span>
                          <Volume2 className="w-4 h-4 text-blue-500 dark:text-blue-400 opacity-60" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer with Quiz Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>وسام الدرس: {activeLesson.badgeName} {activeLesson.badgeIcon}</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                {isCompleted(activeLesson.id) && (
                  <button
                    onClick={() => {
                      audioEngine.playFanfare();
                      audioEngine.playEncouragement(
                        'lesson',
                        `مَا شَاءَ اللهُ! أَنْتَ بَطَلٌ مُتَفَوِّقٌ فِي دَرْسِ «${activeLesson.title}»! وَاسْتَحْقَقْتَ وِسَامَ «${activeLesson.badgeName}»!`
                      );
                    }}
                    className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition shadow-2xs"
                    title="استمع للتعليق الصوتي التشجيعي لهذا الدرس"
                  >
                    <span>🌟 استمع للتشجيع الصوتي</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setActiveQuizLesson(activeLesson);
                    setActiveLesson(null);
                    audioEngine.playClickSound();
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition group"
                >
                  <span>{isCompleted(activeLesson.id) ? 'إعادة الاختبار التقييمي' : 'خوض الاختبار التقييمي الذكي'}</span>
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {activeQuizLesson && (
        <QuizModal
          title={activeQuizLesson.title}
          badgeName={activeQuizLesson.badgeName}
          badgeIcon={activeQuizLesson.badgeIcon}
          questions={activeQuizLesson.quiz}
          onClose={() => setActiveQuizLesson(null)}
          onQuizCompleted={handleLessonQuizCompleted}
        />
      )}
    </div>
  );
};
