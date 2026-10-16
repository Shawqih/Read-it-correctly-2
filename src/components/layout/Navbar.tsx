import React from 'react';
import {
  BookOpen,
  Sparkles,
  Gamepad2,
  Mic,
  Award,
  Layers,
  Smartphone,
  Star,
  Sun,
  Moon,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

export type ActiveTab = 'alphabet' | 'curriculum' | 'stories' | 'games' | 'lab' | 'dashboard' | 'android';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  earnedStars: number;
  studentName: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  earnedStars,
  studentName,
  theme,
  onToggleTheme,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'alphabet', label: 'ركن الحروف والرسم', icon: <Sparkles className="w-5 h-5" />, color: 'hover:text-amber-600' },
    { id: 'curriculum', label: 'المناهج والدروس', icon: <Layers className="w-5 h-5" />, color: 'hover:text-emerald-600' },
    { id: 'stories', label: 'مكتبة القصص (300)', icon: <BookOpen className="w-5 h-5" />, color: 'hover:text-blue-600' },
    { id: 'games', label: 'ألعاب تعليمية', icon: <Gamepad2 className="w-5 h-5" />, color: 'hover:text-purple-600' },
    { id: 'lab', label: 'مختبر النطق الفصيح', icon: <Mic className="w-5 h-5" />, color: 'hover:text-rose-600' },
    { id: 'dashboard', label: 'لوحة المتابعة', icon: <Award className="w-5 h-5" />, color: 'hover:text-indigo-600' },
    { id: 'android', label: 'تطبيق أندرويد و GitHub', icon: <Smartphone className="w-5 h-5" />, color: 'hover:text-teal-600' },
  ];

  const handleToggle = () => {
    audioEngine.playClickSound();
    onToggleTheme();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 dark:from-blue-900 dark:via-indigo-900 dark:to-slate-800 text-white text-xs sm:text-sm py-1.5 px-4 text-center font-medium shadow-inner flex items-center justify-between">
        <div className="flex items-center gap-1.5 mx-auto">
          <span className="inline-block animate-pulse">🌟</span>
          <span>مبادرة مجتمعية تعليمية رائدة بإشراف</span>
          <span className="font-bold underline decoration-amber-300 underline-offset-2">المهندس شوقي حسن الجعور</span>
          <span className="hidden md:inline">| منصة القراءة والنطق الفصيح للصفوف (1-6)</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div
            onClick={() => setActiveTab('alphabet')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 dark:from-blue-500 dark:to-indigo-500 text-white flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-105 transition-transform duration-300">
              أ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
                  أَقْرَأُهَا صَحّْ
                </h1>
                <span className="text-[10px] sm:text-xs bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                  دعم دون إنترنت
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                تعليم القراءة والكتابة والنطق الفصيح
              </p>
            </div>
          </div>

          {/* User Status / Stars / Night Mode */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark Mode Switch Button */}
            <button
              onClick={handleToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all duration-200 cursor-pointer border shadow-xs select-none active:scale-95 ${
                theme === 'dark'
                  ? 'bg-amber-450/20 hover:bg-amber-400/30 text-amber-300 border-amber-500/40 ring-2 ring-amber-400/20'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200 hover:border-indigo-300'
              }`}
              title={theme === 'dark' ? 'انقر للتبديل إلى الوضع النهاري (Light Mode)' : 'انقر للتبديل إلى الوضع الليلي (Dark Mode)'}
              aria-label={theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span className="hidden xs:inline sm:inline">الوضع النهاري ☀️</span>
                  <span className="xs:hidden sm:hidden">نهاري</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-700" />
                  <span className="hidden xs:inline sm:inline">الوضع الليلي 🌙</span>
                  <span className="xs:hidden sm:hidden">ليلي</span>
                </>
              )}
            </button>

            {/* Stars Counter */}
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-3 py-1.5 rounded-full font-bold text-sm sm:text-base shadow-xs">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-500" />
              <span>{earnedStars}</span>
              <span className="text-xs text-amber-700 dark:text-amber-400 hidden sm:inline">نجمة</span>
            </div>

            {/* Student Profile Shortcut */}
            <div
              onClick={() => setActiveTab('dashboard')}
              className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer border border-slate-200 dark:border-slate-700 transition"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                👦
              </div>
              <span>{studentName}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 border-t border-slate-100 dark:border-slate-800/80 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 select-none cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
