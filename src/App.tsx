import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { AlphabetCorner } from './components/alphabet/AlphabetCorner';
import { CurriculumView } from './components/curriculum/CurriculumView';
import { StoriesLibrary } from './components/stories/StoriesLibrary';
import { EducationalGames } from './components/games/EducationalGames';
import { PronunciationLab } from './components/lab/PronunciationLab';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { AndroidExportCenter } from './components/android/AndroidExportCenter';
import { loadUserProgress, saveUserProgress, UserProgress } from './utils/storage';
import { audioEngine } from './utils/audioEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('alphabet');
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress());

  // Apply dark mode class to HTML element
  useEffect(() => {
    const isDark = progress.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [progress.theme]);

  // Save progress on changes
  useEffect(() => {
    saveUserProgress(progress);
  }, [progress]);

  // Handle toggling dark mode
  const handleToggleTheme = () => {
    setProgress((prev) => {
      const nextTheme = prev.theme === 'dark' ? 'light' : 'dark';
      return { ...prev, theme: nextTheme };
    });
  };

  // Handle earning stars
  const handleEarnStar = (stars: number = 1) => {
    setProgress((prev) => {
      const updated = { ...prev, earnedStars: prev.earnedStars + stars };
      return updated;
    });
  };

  // Handle completing curriculum lesson
  const handleCompleteLesson = (lessonId: string, badgeName: string, badgeIcon: string, grade: number) => {
    setProgress((prev) => {
      const isAlreadyCompleted = prev.completedLessons.includes(lessonId);
      const updatedLessons = isAlreadyCompleted ? prev.completedLessons : [...prev.completedLessons, lessonId];

      const hasBadge = prev.badges.some((b) => b.name === badgeName);
      const updatedBadges = hasBadge
        ? prev.badges
        : [
            ...prev.badges,
            {
              id: `badge_${Date.now()}`,
              name: badgeName,
              icon: badgeIcon,
              earnedAt: new Date().toLocaleDateString('ar-EG'),
              grade,
            },
          ];

      return {
        ...prev,
        completedLessons: updatedLessons,
        badges: updatedBadges,
      };
    });
  };

  // Handle marking story as read
  const handleMarkStoryRead = (storyId: string) => {
    setProgress((prev) => {
      if (prev.readStories.includes(storyId)) return prev;
      return {
        ...prev,
        readStories: [...prev.readStories, storyId],
        earnedStars: prev.earnedStars + 2,
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white transition-colors duration-300">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          audioEngine.stop();
          setActiveTab(tab);
        }}
        earnedStars={progress.earnedStars}
        studentName={progress.studentName}
        theme={progress.theme || 'light'}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'alphabet' && (
          <AlphabetCorner onEarnStar={() => handleEarnStar(1)} />
        )}

        {activeTab === 'curriculum' && (
          <CurriculumView
            completedLessons={progress.completedLessons}
            onCompleteLesson={handleCompleteLesson}
            onEarnStar={handleEarnStar}
          />
        )}

        {activeTab === 'stories' && (
          <StoriesLibrary
            readStories={progress.readStories}
            onMarkStoryRead={handleMarkStoryRead}
            onEarnStar={handleEarnStar}
          />
        )}

        {activeTab === 'games' && (
          <EducationalGames onEarnStar={handleEarnStar} />
        )}

        {activeTab === 'lab' && (
          <PronunciationLab onEarnStar={handleEarnStar} />
        )}

        {activeTab === 'dashboard' && (
          <ParentDashboard
            progress={progress}
            onUpdateProgress={(newProgress) => setProgress(newProgress)}
          />
        )}

        {activeTab === 'android' && (
          <AndroidExportCenter />
        )}
      </main>

      {/* Footer - Only containing the requested text */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12 py-6 text-center text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          تم التطوير بواسطة م/ شوقي حسن الجعور
        </div>
      </footer>
    </div>
  );
}
