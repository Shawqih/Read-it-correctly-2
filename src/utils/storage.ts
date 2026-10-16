export interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedAt: string;
  grade: number;
}

export interface QuizRecord {
  score: number;
  total: number;
  date: string;
  perfect: boolean;
}

export interface UserProgress {
  studentName: string;
  studentGrade: number;
  earnedStars: number;
  completedLessons: string[];
  readStories: string[];
  badges: Badge[];
  quizScores: Record<string, QuizRecord>;
  preferredVoice: string;
  theme: 'light' | 'dark';
}

const STORAGE_KEY = 'aqraha_sah_user_progress_v1';

const DEFAULT_PROGRESS: UserProgress = {
  studentName: 'البطل القارئ',
  studentGrade: 1,
  earnedStars: 15,
  completedLessons: [],
  readStories: [],
  badges: [
    {
      id: 'welcome_badge',
      name: 'وسام الانطلاقة الأولى',
      icon: '🌟',
      earnedAt: new Date().toLocaleDateString('ar-EG'),
      grade: 1,
    },
  ],
  quizScores: {},
  preferredVoice: 'Kore',
  theme: 'light',
};

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme: 'light' | 'dark' = prefersDark ? 'dark' : 'light';

    if (!raw) {
      return { ...DEFAULT_PROGRESS, theme: initialTheme };
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      theme: parsed.theme || initialTheme,
    };
  } catch (e) {
    console.error('Error loading user progress:', e);
    return DEFAULT_PROGRESS;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving user progress:', e);
  }
}

export function resetUserProgress(): UserProgress {
  const current = loadUserProgress();
  const reset: UserProgress = {
    ...DEFAULT_PROGRESS,
    theme: current.theme,
    studentName: current.studentName,
    studentGrade: current.studentGrade,
    earnedStars: 0,
    completedLessons: [],
    readStories: [],
    badges: [],
    quizScores: {},
  };
  saveUserProgress(reset);
  return reset;
}
