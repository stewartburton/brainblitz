// ============================================================
// Frenchie Trivia — Score Calculation Engine
// ============================================================

import { Difficulty, ScoreBreakdown } from '@/types';
import {
  BASE_POINTS_EASY,
  BASE_POINTS_MEDIUM,
  BASE_POINTS_HARD,
  MAX_SPEED_BONUS,
  STREAK_BONUS_PER_STEP,
  MAX_STREAK_BONUS_MULTIPLIER,
} from './constants';

/**
 * Calculate score breakdown for a single answer.
 *
 * Points come from three sources:
 * 1. Base points (determined by difficulty)
 * 2. Speed bonus (faster answer = more points, linear scale)
 * 3. Streak bonus (consecutive correct answers, capped at 5x)
 */
export function calculateScore(params: {
  isCorrect: boolean;
  timeLeft: number;
  timerDuration: number;
  currentStreak: number;
  difficulty: Difficulty;
}): ScoreBreakdown {
  if (!params.isCorrect) {
    return { base: 0, speed: 0, streak: 0, difficulty: 0, total: 0 };
  }

  // Base points by difficulty
  const baseMap: Record<Difficulty, number> = {
    easy: BASE_POINTS_EASY,
    medium: BASE_POINTS_MEDIUM,
    hard: BASE_POINTS_HARD,
  };
  const base = baseMap[params.difficulty];

  // Speed bonus: linear from 0 to MAX_SPEED_BONUS based on time remaining
  const speedRatio = Math.max(0, params.timeLeft / params.timerDuration);
  const speed = Math.round(speedRatio * MAX_SPEED_BONUS);

  // Streak bonus: 20 points per consecutive correct, capped at 5
  const streakSteps = Math.min(
    params.currentStreak,
    MAX_STREAK_BONUS_MULTIPLIER
  );
  const streak = streakSteps * STREAK_BONUS_PER_STEP;

  // Difficulty multiplier for display
  const difficultyMultiplier =
    params.difficulty === 'easy' ? 1 : params.difficulty === 'medium' ? 1.5 : 2;

  const total = base + speed + streak;

  return {
    base,
    speed,
    streak,
    difficulty: difficultyMultiplier,
    total,
  };
}

/**
 * Calculate XP earned from a completed game.
 * XP = total score (simple 1:1 mapping for now).
 */
export function calculateXpEarned(gameScore: number): number {
  return gameScore;
}

/**
 * Format a score number with commas for display.
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}

/**
 * Format time in seconds to MM:SS or S.Xs display.
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate accuracy percentage.
 */
export function calculateAccuracy(
  correct: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
