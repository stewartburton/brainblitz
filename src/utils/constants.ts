// ============================================================
// Frenchie Trivia — App Constants
// ============================================================

import { Category, Difficulty, GameConfig } from '@/types';

// --- API ---
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://frenchie-trivia-api.workers.dev';

// --- Game Defaults ---
export const DEFAULT_ROUNDS = 10;
export const DEFAULT_TIMER_EASY = 30;
export const DEFAULT_TIMER_MEDIUM = 20;
export const DEFAULT_TIMER_HARD = 15;
export const DEFAULT_TIMER_SPEED = 5;

export const DEFAULT_GAME_CONFIG: GameConfig = {
  mode: 'casual',
  category: 'all',
  difficulty: 'mixed',
  totalRounds: DEFAULT_ROUNDS,
  timerDuration: DEFAULT_TIMER_MEDIUM,
};

// --- Scoring ---
export const BASE_POINTS_EASY = 100;
export const BASE_POINTS_MEDIUM = 150;
export const BASE_POINTS_HARD = 200;
export const MAX_SPEED_BONUS = 100;
export const STREAK_BONUS_PER_STEP = 20;
export const MAX_STREAK_BONUS_MULTIPLIER = 5; // cap at 5x streak

// --- Difficulty config ---
export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { basePoints: number; timerSeconds: number; label: string; color: string }
> = {
  easy: {
    basePoints: BASE_POINTS_EASY,
    timerSeconds: DEFAULT_TIMER_EASY,
    label: 'Easy',
    color: '#00B894',
  },
  medium: {
    basePoints: BASE_POINTS_MEDIUM,
    timerSeconds: DEFAULT_TIMER_MEDIUM,
    label: 'Medium',
    color: '#FDCB6E',
  },
  hard: {
    basePoints: BASE_POINTS_HARD,
    timerSeconds: DEFAULT_TIMER_HARD,
    label: 'Hard',
    color: '#E17055',
  },
};

// --- Frenchie Feedback Expressions ---
export const FEEDBACK_CORRECT = [
  'Pawfect! 🐾',
  'Good boy! 🐕',
  'Tail wags! 🐕‍🦺',
  'Treat earned! 🦴',
  'Top dog! 🏆',
  'Fetch that point!',
  'Barking brilliant!',
  'Snoot boop! 👃',
];

export const FEEDBACK_WRONG = [
  'Ruff luck! 🐾',
  'Back to the crate!',
  'Oops, wrong paw!',
  'Not this time, pup!',
  'Squished that one!',
  'Walkies over! 🚶',
];

export const FEEDBACK_TIMEOUT = [
  'Too slow, sleepy Frenchie! 😴',
  'Snoring on the job! 💤',
  'Time for a nap? ⏰',
];

export const FEEDBACK_STREAK = [
  'ON A WALK! 🐕',
  'Zoomies mode! 💨',
  'Hot streak! 🔥',
];

export const FEEDBACK_MEGA_STREAK = [
  'ALPHA FRENCHIE! 🔥👑',
  'UNSTOPPABLE! 🐾🔥',
  'LEGENDARY! ⭐🐕',
];

// --- Avatar Options ---
export const FRENCHIE_AVATARS = [

// --- Categories ---
export const CATEGORY_LABELS: Record<string, string> = {
  breed_history: '📜 Breed History',
  health_wellness: '🏥 Health & Wellness',
  genetics_colours: '🧬 Genetics & Colours',
  anatomy: '🐕 Anatomy',
  personality: '🧠 Personality',
  famous_frenchies: '⭐ Famous Frenchies',
  puppy_care: '🍼 Puppy Care',
  nutrition: '🦴 Nutrition',
  training: '🎾 Training',
  frenchie_vs_world: '🌍 Frenchie vs World',
  pop_culture: '🎬 Pop Culture',
  true_or_false: '✅ True or False',
  speed_round: '⚡ Speed Round',
  expert_only: '🎓 Expert Only',
};

export const CATEGORIES_LIST = [
  { key: 'all', label: '🎲 All Categories', icon: '🎲' },
  { key: 'breed_history', label: 'Breed History', icon: '📜' },
  { key: 'health_wellness', label: 'Health & Wellness', icon: '🏥' },
  { key: 'genetics_colours', label: 'Genetics & Colours', icon: '🧬' },
  { key: 'anatomy', label: 'Anatomy', icon: '🐕' },
  { key: 'personality', label: 'Personality', icon: '🧠' },
  { key: 'famous_frenchies', label: 'Famous Frenchies', icon: '⭐' },
  { key: 'puppy_care', label: 'Puppy Care', icon: '🍼' },
  { key: 'nutrition', label: 'Nutrition', icon: '🦴' },
  { key: 'training', label: 'Training', icon: '🎾' },
  { key: 'frenchie_vs_world', label: 'Frenchie vs World', icon: '🌍' },
  { key: 'pop_culture', label: 'Pop Culture', icon: '🎬' },
  { key: 'true_or_false', label: 'True or False', icon: '✅' },
  { key: 'speed_round', label: 'Speed Round', icon: '⚡' },
  { key: 'expert_only', label: 'Expert Only', icon: '🎓' },
];

// --- Avatar Options ---
export const FRENCHIE_AVATARS = [
  { id: 'fawn', label: 'Fawn Frenchie', emoji: '🐕' },
  { id: 'brindle', label: 'Brindle Frenchie', emoji: '🐾' },
  { id: 'pied', label: 'Pied Frenchie', emoji: '🐶' },
  { id: 'cream', label: 'Cream Frenchie', emoji: '🦮' },
  { id: 'blue', label: 'Blue Frenchie', emoji: '💙' },
  { id: 'lilac', label: 'Lilac Frenchie', emoji: '💜' },
  { id: 'merle', label: 'Merle Frenchie', emoji: '🌀' },
  { id: 'chocolate', label: 'Chocolate Frenchie', emoji: '🍫' },
  { id: 'black', label: 'Black Frenchie', emoji: '🖤' },
  { id: 'white', label: 'White Frenchie', emoji: '🤍' },
];

// --- XP Level Thresholds ---
export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Frenchie Pup 🐶' },
  { level: 5, xp: 500, title: 'Frenchie Pup 🐶' },
  { level: 10, xp: 2000, title: 'Frenchie Fan 🐕' },
  { level: 15, xp: 5000, title: 'Frenchie Fan 🐕' },
  { level: 20, xp: 10000, title: 'Frenchie Enthusiast 🐾' },
  { level: 25, xp: 18000, title: 'Frenchie Enthusiast 🐾' },
  { level: 30, xp: 28000, title: 'Frenchie Expert 🎓' },
  { level: 35, xp: 40000, title: 'Frenchie Expert 🎓' },
  { level: 40, xp: 55000, title: 'Frenchie Master 👑' },
  { level: 45, xp: 72000, title: 'Frenchie Master 👑' },
  { level: 50, xp: 100000, title: 'Frenchie Champion 🏆' },
];

export function getLevelForXp(totalXp: number): {
  level: number;
  title: string;
  nextLevelXp: number;
  progressPercent: number;
} {
  let currentLevel = LEVEL_THRESHOLDS[0];
  let nextLevel = LEVEL_THRESHOLDS[1];

  for (let i = 0; i < LEVEL_THRESHOLDS.length - 1; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xp) {
      currentLevel = LEVEL_THRESHOLDS[i];
      nextLevel = LEVEL_THRESHOLDS[i + 1];
    }
  }

  // Beyond max level
  if (totalXp >= LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].xp) {
    const last = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const extraLevels = Math.floor((totalXp - last.xp) / 10000);
    return {
      level: last.level + extraLevels,
      title: last.title,
      nextLevelXp: last.xp + (extraLevels + 1) * 10000,
      progressPercent:
        ((totalXp - (last.xp + extraLevels * 10000)) / 10000) * 100,
    };
  }

  const progress = totalXp - currentLevel.xp;
  const needed = nextLevel.xp - currentLevel.xp;

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    nextLevelXp: nextLevel.xp,
    progressPercent: needed > 0 ? (progress / needed) * 100 : 100,
  };
}

// --- Random helpers ---
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
