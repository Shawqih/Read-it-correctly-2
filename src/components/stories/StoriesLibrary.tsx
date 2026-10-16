import React, { useState } from 'react';
import { ALL_STORIES, Story } from '../../data/storiesData';
import { QuizModal } from '../quiz/QuizModal';
import {
  BookOpen,
  Search,
  Sparkles,
  Volume2,
  Play,
  Pause,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface StoriesLibraryProps {
  readStories: string[];
  onMarkStoryRead: (storyId: string) => void;
  onEarnStar: (stars?: number) => void;
}

export const StoriesLibrary: React.FC<StoriesLibraryProps> = ({
  readStories,
  onMarkStoryRead,
  onEarnStar,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [isPlayingStory, setIsPlayingStory] = useState(false);
  const [showStoryQuiz, setShowStoryQuiz] = useState(false);

  // Filter stories
  const filteredStories = ALL_STORIES.filter((s) => {
    const matchesGrade = s.grade === selectedGrade;
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      s.title.includes(searchQuery) ||
      s.moralLesson.includes(searchQuery);
    return matchesGrade && matchesCategory && matchesSearch;
  });

  const categories = ['all', 'قيم أخلاقية', 'مغامرات شيقة', 'حكايات تراثية', 'علوم واكتشافات', 'شخصيات ملهمة'];

  // Start reading story audio aloud
  const togglePlayStory = () => {
    if (!activeStory) return;

    if (isPlayingStory) {
      audioEngine.stop();
      setIsPlayingStory(false);
    } else {
      setIsPlayingStory(true);
      const fullText = `${activeStory.title}. ${activeStory.content.join('. ')}. العبرة من القصة: ${activeStory.moralLesson}`;
      audioEngine.speak(fullText, {
        onEnd: () => setIsPlayingStory(false),
        onError: () => setIsPlayingStory(false),
      });
    }
  };

  const handleOpenStory = (story: Story) => {
    audioEngine.stop();
    setIsPlayingStory(false);
    setActiveStory(story);
    onMarkStoryRead(story.id);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'normal':
        return 'text-base leading-loose';
      case 'large':
        return 'text-lg sm:text-xl leading-loose';
      case 'xlarge':
        return 'text-xl sm:text-2xl leading-loose';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-600 dark:from-blue-900 dark:via-sky-900 dark:to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden transition-colors">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-amber-200 mb-3 border border-white/20">
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>أكبر مكتبة قصصية للأطفال (300 قصة شيقة ومشكولة)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
            خَمْسُونَ قِصَّةً هَادِفَةً مُخَصَّصَةً لِكُلِّ صَفٍّ دِرَاسِيٍّ
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-sky-100 leading-relaxed max-w-2xl">
            قصص مزودة بنطق صوتي متقن، وقيم أخلاقية نبيلة، وأسئلة فهم استيعابي ذكية، مع إمكانية تكبير الخط للقراءة المريحة في الوضعين النهاري والليلي.
          </p>
        </div>
      </div>

      {/* Grade Tabs & Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        {/* Grade Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
            اختر الصف الدراسي:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[1, 2, 3, 4, 5, 6].map((g) => {
              const isSelected = selectedGrade === g;
              return (
                <button
                  key={g}
                  onClick={() => {
                    setSelectedGrade(g);
                    audioEngine.playClickSound();
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer select-none ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  الصف {g} (50 قصة)
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Categories Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن قصة أو فكرة..."
              className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-750 focus:outline-hidden focus:ring-2 focus:ring-blue-400 font-medium placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  audioEngine.playClickSound();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {cat === 'all' ? 'جميع التصنيفات' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredStories.map((story) => {
          const isRead = readStories.includes(story.id);
          return (
            <div
              key={story.id}
              onClick={() => handleOpenStory(story)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl p-2 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                    {story.coverEmoji}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span>{story.readTime}</span>
                  </div>
                </div>

                <div className="text-[11px] font-bold text-sky-700 dark:text-sky-400 mb-1">
                  {story.category}
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug">
                  {story.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  💡 {story.moralLesson}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                <span className="text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                  <span>اقرأ واستمع</span>
                  <span>←</span>
                </span>
                {isRead && (
                  <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">✓ تمت القراءة</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Story Reader Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 relative max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60">{activeStory.coverEmoji}</span>
                <div>
                  <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                    الصف {activeStory.grade} • {activeStory.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {activeStory.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  audioEngine.stop();
                  setIsPlayingStory(false);
                  setActiveStory(null);
                }}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Audio & Font Size Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 my-4 py-2 px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              {/* Play / Pause Voice */}
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayStory}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer shadow-xs ${
                    isPlayingStory
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isPlayingStory ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>إيقاف القراءة مؤقتاً</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>قراءة القصة بصوت فصيح</span>
                    </>
                  )}
                </button>
              </div>

              {/* Font Sizing */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">حجم الخط:</span>
                {(['normal', 'large', 'xlarge'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setFontSize(sz)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      fontSize === sz
                        ? 'bg-slate-900 dark:bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    {sz === 'normal' ? 'عادي' : sz === 'large' ? 'كبير' : 'كبير جداً'}
                  </button>
                ))}
              </div>
            </div>

            {/* Story Paragraphs */}
            <div className="space-y-4 my-6 text-slate-800 dark:text-slate-100">
              {activeStory.content.map((paragraph, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 hover:bg-sky-50/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/60 hover:border-sky-200 dark:hover:border-sky-600/40 transition group flex items-start justify-between gap-3"
                >
                  <p className={`font-medium ${getFontSizeClass()}`}>
                    {paragraph}
                  </p>
                  <button
                    onClick={() => audioEngine.speak(paragraph)}
                    className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-slate-700 transition cursor-pointer shrink-0 mt-1"
                    title="قراءة هذه الفقرة فقط"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Moral Lesson Box */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800/60 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-1.5 text-amber-900 dark:text-amber-300 font-black text-sm">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>القيم الأخلاقية والعبرة المستفادة:</span>
              </div>
              <p className="text-sm font-bold text-amber-950 dark:text-amber-100 leading-relaxed">
                {activeStory.moralLesson}
              </p>
            </div>

            {/* Footer with Comprehension Quiz */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                أكملت قراءة القصة بنجاح!
              </div>

              <button
                onClick={() => {
                  audioEngine.stop();
                  setIsPlayingStory(false);
                  setShowStoryQuiz(true);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition"
              >
                <HelpCircle className="w-4 h-4" />
                <span>أسئلة الفهم الاستيعابي</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehension Quiz Modal */}
      {showStoryQuiz && activeStory && (
        <QuizModal
          title={`الفهم الاستيعابي: ${activeStory.title}`}
          badgeName="وسام القارئ المستوعب"
          badgeIcon="🏆"
          questions={activeStory.comprehensionQuiz.map((q, idx) => ({
            id: `story_q_${activeStory.id}_${idx}`,
            ...q,
          }))}
          onClose={() => setShowStoryQuiz(false)}
          onQuizCompleted={(score, total, perfect) => {
            if (perfect) {
              onEarnStar(10);
            } else {
              onEarnStar(4);
            }
          }}
        />
      )}
    </div>
  );
};
