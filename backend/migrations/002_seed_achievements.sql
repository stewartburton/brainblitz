-- ============================================================
-- Frenchie Trivia — Achievement Seed Data
-- Migration 002: Seed achievements table
-- ============================================================

INSERT OR IGNORE INTO achievements (id, name, description, icon, category, requirement_type, requirement_value, is_secret) VALUES
-- Gameplay
('first_steps', 'First Steps', 'Complete your first trivia game', '🐾', 'gameplay', 'games_played', 1, 0),
('ten_games', 'Regular Walker', 'Complete 10 games', '🚶', 'gameplay', 'games_played', 10, 0),
('fifty_games', 'Marathon Frenchie', 'Complete 50 games', '🏃', 'gameplay', 'games_played', 50, 0),
('hundred_games', 'Unstoppable', 'Complete 100 games', '💪', 'gameplay', 'games_played', 100, 0),
('perfect_ten', 'Pawfect 10!', 'Get all 10 questions correct in a game', '💯', 'gameplay', 'perfect_game', 10, 0),
('no_wrong', 'Flawless Victory', 'Complete a 15-question ranked game with no wrong answers', '🌟', 'gameplay', 'perfect_ranked', 15, 0),

-- Streaks
('streak_3', 'On a Walk', 'Get a 3-question answer streak', '🔥', 'streak', 'best_streak', 3, 0),
('streak_5', 'Zoomies Mode', 'Get a 5-question answer streak', '💨', 'streak', 'best_streak', 5, 0),
('streak_10', 'Turbo Frenchie', 'Get a 10-question answer streak', '⚡', 'streak', 'best_streak', 10, 0),
('streak_15', 'Absolutely Legendary', 'Get a 15-question answer streak', '👑', 'streak', 'best_streak', 15, 0),

-- Score
('score_500', 'Points Pup', 'Score 500+ points in a single game', '📈', 'score', 'game_score', 500, 0),
('score_1000', 'Century Club', 'Score 1,000+ points in a single game', '🎯', 'score', 'game_score', 1000, 0),
('score_2000', 'High Roller', 'Score 2,000+ points in a single game', '🎰', 'score', 'game_score', 2000, 0),
('score_3000', 'Top Dog', 'Score 3,000+ points in a single game', '🏅', 'score', 'game_score', 3000, 0),
('total_10k', 'XP Hound', 'Accumulate 10,000 total XP', '📊', 'score', 'total_xp', 10000, 0),
('total_50k', 'XP Machine', 'Accumulate 50,000 total XP', '🤖', 'score', 'total_xp', 50000, 0),
('total_100k', 'XP Legend', 'Accumulate 100,000 total XP', '🏆', 'score', 'total_xp', 100000, 0),

-- Speed
('speed_demon', 'Speed Demon', 'Answer a question correctly in under 2 seconds', '⚡', 'gameplay', 'answer_time_under', 2, 0),
('blitz', 'Lightning Paws', 'Answer a question correctly in under 1 second', '🌩️', 'gameplay', 'answer_time_under', 1, 1),
('fast_game', 'Fast Fingers', 'Complete a game with average answer time under 5 seconds', '🏎️', 'gameplay', 'avg_time_under', 5, 0),

-- Categories
('health_hero', 'Health Hero', 'Answer 50 Health & Wellness questions correctly', '🏥', 'gameplay', 'category_correct', 50, 0),
('history_buff', 'History Buff', 'Answer 50 Breed History questions correctly', '📜', 'gameplay', 'category_correct', 50, 0),
('genetics_guru', 'Genetics Guru', 'Answer 50 Genetics & Colours questions correctly', '🧬', 'gameplay', 'category_correct', 50, 0),

-- Levels
('level_10', 'Frenchie Fan', 'Reach Level 10', '🐕', 'score', 'level_reached', 10, 0),
('level_25', 'Frenchie Enthusiast', 'Reach Level 25', '🐾', 'score', 'level_reached', 25, 0),
('level_50', 'Frenchie Champion', 'Reach Level 50', '🏆', 'score', 'level_reached', 50, 0),

-- Special
('comeback', 'Comeback King', 'Get the last 5 correct after getting the first 5 wrong', '🔄', 'special', 'comeback', 1, 0),
('nail_biter', 'Nail Biter', 'Answer correctly with less than 1 second remaining', '😰', 'special', 'nail_biter', 1, 0),
('explorer', 'Explorer', 'Play at least one game in every category', '🗺️', 'special', 'categories_played', 14, 0),
('trivia_titan', 'Trivia Titan', 'Earn all other achievements', '💎', 'special', 'all_achievements', 1, 1);
