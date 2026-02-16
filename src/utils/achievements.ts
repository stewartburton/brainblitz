// ============================================================
// Frenchie Trivia — Achievement Definitions & Checker
// 30 achievements covering gameplay, streaks, score, and more
// ============================================================

import { Achievement, GameResult, User } from '@/types';

export const ACHIEVEMENTS: Achievement[] = [
  // --- Gameplay ---
  { id: 'first_steps', name: 'First Steps', description: 'Complete your first trivia game', icon: '🐾', category: 'gameplay', isSecret: false },
  { id: 'ten_games', name: 'Regular Walker', description: 'Complete 10 games', icon: '🚶', category: 'gameplay', isSecret: false },
  { id: 'fifty_games', name: 'Marathon Frenchie', description: 'Complete 50 games', icon: '🏃', category: 'gameplay', isSecret: false },
  { id: 'hundred_games', name: 'Unstoppable', description: 'Complete 100 games', icon: '💪', category: 'gameplay', isSecret: false },
  { id: 'perfect_ten', name: 'Pawfect 10!', description: 'Get all 10 questions correct in a game', icon: '💯', category: 'gameplay', isSecret: false },
  { id: 'no_wrong', name: 'Flawless Victory', description: 'Complete a 15-question ranked game with no wrong answers', icon: '🌟', category: 'gameplay', isSecret: false },

  // --- Streaks ---
  { id: 'streak_3', name: 'On a Walk', description: 'Get a 3-question answer streak', icon: '🔥', category: 'streak', isSecret: false },
  { id: 'streak_5', name: 'Zoomies Mode', description: 'Get a 5-question answer streak', icon: '💨', category: 'streak', isSecret: false },
  { id: 'streak_10', name: 'Turbo Frenchie', description: 'Get a 10-question answer streak', icon: '⚡', category: 'streak', isSecret: false },
  { id: 'streak_15', name: 'Absolutely Legendary', description: 'Get a 15-question answer streak (perfect ranked game)', icon: '👑', category: 'streak', isSecret: false },

  // --- Score ---
  { id: 'score_500', name: 'Points Pup', description: 'Score 500+ points in a single game', icon: '📈', category: 'score', isSecret: false },
  { id: 'score_1000', name: 'Century Club', description: 'Score 1,000+ points in a single game', icon: '🎯', category: 'score', isSecret: false },
  { id: 'score_2000', name: 'High Roller', description: 'Score 2,000+ points in a single game', icon: '🎰', category: 'score', isSecret: false },
  { id: 'score_3000', name: 'Top Dog', description: 'Score 3,000+ points in a single game', icon: '🏅', category: 'score', isSecret: false },
  { id: 'total_10k', name: 'XP Hound', description: 'Accumulate 10,000 total XP', icon: '📊', category: 'score', isSecret: false },
  { id: 'total_50k', name: 'XP Machine', description: 'Accumulate 50,000 total XP', icon: '🤖', category: 'score', isSecret: false },
  { id: 'total_100k', name: 'XP Legend', description: 'Accumulate 100,000 total XP', icon: '🏆', category: 'score', isSecret: false },

  // --- Speed ---
  { id: 'speed_demon', name: 'Speed Demon', description: 'Answer a question correctly in under 2 seconds', icon: '⚡', category: 'gameplay', isSecret: false },
  { id: 'blitz', name: 'Lightning Paws', description: 'Answer a question correctly in under 1 second', icon: '🌩️', category: 'gameplay', isSecret: true },
  { id: 'fast_game', name: 'Fast Fingers', description: 'Complete a game with average answer time under 5 seconds', icon: '🏎️', category: 'gameplay', isSecret: false },

  // --- Categories ---
  { id: 'health_hero', name: 'Health Hero', description: 'Answer 50 Health & Wellness questions correctly', icon: '🏥', category: 'gameplay', isSecret: false },
  { id: 'history_buff', name: 'History Buff', description: 'Answer 50 Breed History questions correctly', icon: '📜', category: 'gameplay', isSecret: false },
  { id: 'genetics_guru', name: 'Genetics Guru', description: 'Answer 50 Genetics & Colours questions correctly', icon: '🧬', category: 'gameplay', isSecret: false },

  // --- Levels ---
  { id: 'level_10', name: 'Frenchie Fan', description: 'Reach Level 10', icon: '🐕', category: 'score', isSecret: false },
  { id: 'level_25', name: 'Frenchie Enthusiast', description: 'Reach Level 25', icon: '🐾', category: 'score', isSecret: false },
  { id: 'level_50', name: 'Frenchie Champion', description: 'Reach Level 50', icon: '🏆', category: 'score', isSecret: false },

  // --- Special ---
  { id: 'comeback', name: 'Comeback King', description: 'Get the last 5 questions correct after getting the first 5 wrong', icon: '🔄', category: 'special', isSecret: false },
  { id: 'nail_biter', name: 'Nail Biter', description: 'Answer correctly with less than 1 second remaining', icon: '😰', category: 'special', isSecret: false },
  { id: 'explorer', name: 'Explorer', description: 'Play at least one game in every category', icon: '🗺️', category: 'special', isSecret: false },
  { id: 'trivia_titan', name: 'Trivia Titan', description: 'Earn all other achievements', icon: '💎', category: 'special', isSecret: true },
];

/**
 * Check which new achievements were earned from a game result.
 * Returns IDs of newly earned achievements.
 */
export function checkAchievements(
  result: GameResult,
  user: User,
  earnedAchievementIds: Set<string>
): string[] {
  const newlyEarned: string[] = [];

  function grant(id: string) {
    if (!earnedAchievementIds.has(id)) {
      newlyEarned.push(id);
    }
  }

  const totalGamesAfter = user.totalGames + 1;
  const totalXpAfter = user.totalXp + result.score;

  // Gameplay milestones
  if (totalGamesAfter >= 1) grant('first_steps');
  if (totalGamesAfter >= 10) grant('ten_games');
  if (totalGamesAfter >= 50) grant('fifty_games');
  if (totalGamesAfter >= 100) grant('hundred_games');

  // Perfect games
  if (result.correctCount === result.totalRounds && result.totalRounds >= 10) {
    grant('perfect_ten');
  }
  if (result.correctCount === result.totalRounds && result.totalRounds >= 15 && result.mode === 'ranked') {
    grant('no_wrong');
  }

  // Streaks
  if (result.bestStreak >= 3) grant('streak_3');
  if (result.bestStreak >= 5) grant('streak_5');
  if (result.bestStreak >= 10) grant('streak_10');
  if (result.bestStreak >= 15) grant('streak_15');

  // Score milestones
  if (result.score >= 500) grant('score_500');
  if (result.score >= 1000) grant('score_1000');
  if (result.score >= 2000) grant('score_2000');
  if (result.score >= 3000) grant('score_3000');

  // Total XP
  if (totalXpAfter >= 10000) grant('total_10k');
  if (totalXpAfter >= 50000) grant('total_50k');
  if (totalXpAfter >= 100000) grant('total_100k');

  // Speed
  const fastestAnswer = Math.min(...result.roundResults.filter(r => r.isCorrect).map(r => r.timeSpent));
  if (fastestAnswer < 2) grant('speed_demon');
  if (fastestAnswer < 1) grant('blitz');
  if (result.averageTimePerQuestion < 5) grant('fast_game');

  // Nail biter — correct with < 1 second left
  const timerDurations: Record<string, number> = { easy: 30, medium: 20, hard: 15 };
  for (const round of result.roundResults) {
    if (round.isCorrect) {
      // timeSpent is close to timerDuration means very little time left
      // We'd need the timer duration for each question's difficulty to know for sure
      // Approximate: if timeSpent > 19 on a medium question, that's < 1s left
      if (round.timeSpent > 19) grant('nail_biter');
    }
  }

  // Comeback — first 5 wrong, last 5 correct
  if (result.roundResults.length >= 10) {
    const firstFive = result.roundResults.slice(0, 5);
    const lastFive = result.roundResults.slice(-5);
    if (firstFive.every(r => !r.isCorrect) && lastFive.every(r => r.isCorrect)) {
      grant('comeback');
    }
  }

  // Level milestones (check level from XP)
  const level = calculateLevelFromXp(totalXpAfter);
  if (level >= 10) grant('level_10');
  if (level >= 25) grant('level_25');
  if (level >= 50) grant('level_50');

  return newlyEarned;
}

function calculateLevelFromXp(xp: number): number {
  const thresholds = [0, 500, 2000, 5000, 10000, 18000, 28000, 40000, 55000, 72000, 100000];
  const levels =     [1, 5,   10,   15,   20,    25,    30,    35,    40,    45,    50];
  let level = 1;
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = levels[i];
  }
  if (xp >= 100000) {
    level = 50 + Math.floor((xp - 100000) / 10000);
  }
  return level;
}

/**
 * Get achievement details by ID.
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}
