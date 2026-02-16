// ============================================================
// Frenchie Trivia — Core Types
// ============================================================

// --- Questions ---

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Category =
  | 'breed_history'
  | 'health_wellness'
  | 'genetics_colours'
  | 'anatomy'
  | 'personality'
  | 'famous_frenchies'
  | 'puppy_care'
  | 'nutrition'
  | 'training'
  | 'frenchie_vs_world'
  | 'pop_culture'
  | 'true_or_false'
  | 'speed_round'
  | 'expert_only';

export const CATEGORY_LABELS: Record<Category, string> = {
  breed_history: 'Breed History',
  health_wellness: 'Health & Wellness',
  genetics_colours: 'Genetics & Colours',
  anatomy: 'Anatomy & Appearance',
  personality: 'Personality & Behaviour',
  famous_frenchies: 'Famous Frenchies',
  puppy_care: 'Puppy Care',
  nutrition: 'Nutrition & Diet',
  training: 'Training Tips',
  frenchie_vs_world: 'Frenchie vs The World',
  pop_culture: 'Pop Culture',
  true_or_false: 'True or False',
  speed_round: 'Speed Round',
  expert_only: 'Expert Only',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  breed_history: '📜',
  health_wellness: '🏥',
  genetics_colours: '🧬',
  anatomy: '🐕',
  personality: '🧠',
  famous_frenchies: '⭐',
  puppy_care: '🍼',
  nutrition: '🦴',
  training: '🎾',
  frenchie_vs_world: '🌍',
  pop_culture: '🎬',
  true_or_false: '✅',
  speed_round: '⚡',
  expert_only: '🎓',
};

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  explanation?: string;
  funFact?: string;
  audioUrl?: string;
  imageUrl?: string;
  isPremium: boolean;
}

export interface ShuffledQuestion extends Question {
  shuffledAnswers: string[];
  correctIndex: number;
}

// --- Game State ---

export type GameMode = 'casual' | 'ranked' | 'daily' | 'challenge';

export type GamePhase =
  | 'idle'
  | 'setup'
  | 'countdown'
  | 'playing'
  | 'answered'
  | 'reveal'
  | 'feedback'
  | 'between_rounds'
  | 'results'
  | 'error';

export interface GameConfig {
  mode: GameMode;
  category: Category | 'all';
  difficulty: Difficulty | 'mixed';
  totalRounds: number;
  timerDuration: number; // seconds per question
}

export interface RoundResult {
  questionId: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // seconds
  pointsEarned: number;
  speedBonus: number;
  streakBonus: number;
}

export interface GameState {
  phase: GamePhase;
  config: GameConfig;
  currentRound: number;
  currentQuestion: ShuffledQuestion | null;
  selectedAnswerIndex: number | null;
  score: number;
  streak: number;
  bestStreak: number;
  correctCount: number;
  timeLeft: number;
  roundResults: RoundResult[];
  startedAt: number | null;
}

export interface GameResult {
  sessionId: string;
  userId: string;
  mode: GameMode;
  category: Category | 'all';
  difficulty: Difficulty | 'mixed';
  totalRounds: number;
  correctCount: number;
  score: number;
  bestStreak: number;
  averageTimePerQuestion: number;
  totalTimeTaken: number;
  roundResults: RoundResult[];
  completedAt: string;
}

// --- Scoring ---

export interface ScoreBreakdown {
  base: number;
  speed: number;
  streak: number;
  difficulty: number;
  total: number;
}

// --- Users ---

export type AuthProvider = 'anonymous' | 'email' | 'apple' | 'google';

export interface User {
  id: string;
  deviceId: string;
  displayName: string;
  avatarId: string;
  authProvider: AuthProvider;
  email?: string;
  level: number;
  totalXp: number;
  totalGames: number;
  totalCorrect: number;
  totalScore: number;
  bestGameScore: number;
  bestStreak: number;
  isPremium: boolean;
  createdAt: string;
  lastPlayedAt?: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  avatarId: string;
  level: number;
  totalXp: number;
  totalGames: number;
  accuracy: number; // percentage
  bestGameScore: number;
  bestStreak: number;
  rank?: number;
}

// --- Leaderboard ---

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarId: string;
  level: number;
  score: number;
  rank: number;
  isCurrentUser?: boolean;
}

export type LeaderboardPeriod = 'alltime' | 'weekly' | 'monthly' | 'daily';

// --- Achievements ---

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'gameplay' | 'streak' | 'score' | 'social' | 'special';
  isSecret: boolean;
}

export interface UserAchievement extends Achievement {
  earnedAt: string;
}

// --- API ---

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
