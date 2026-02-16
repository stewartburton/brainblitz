-- ============================================================
-- Frenchie Trivia — D1 Database Schema
-- Migration 001: Initial schema
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  device_id TEXT UNIQUE,
  email TEXT UNIQUE,
  display_name TEXT NOT NULL,
  avatar_id TEXT DEFAULT 'fawn',
  auth_provider TEXT DEFAULT 'anonymous',
  firebase_uid TEXT UNIQUE,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  best_game_score INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  is_premium INTEGER DEFAULT 0,
  is_banned INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  last_played_at TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_total_score ON users(total_score DESC);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  incorrect_answer_1 TEXT NOT NULL,
  incorrect_answer_2 TEXT NOT NULL,
  incorrect_answer_3 TEXT,
  explanation TEXT,
  fun_fact TEXT,
  source TEXT,
  is_premium INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active);

-- Game sessions
CREATE TABLE IF NOT EXISTS game_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  category TEXT,
  difficulty TEXT,
  total_rounds INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  score INTEGER NOT NULL,
  best_streak INTEGER DEFAULT 0,
  average_time REAL,
  completed_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_score ON game_sessions(score DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_completed ON game_sessions(completed_at);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  is_secret INTEGER DEFAULT 0
);

-- User achievements (earned)
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  earned_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, achievement_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- Daily challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  date TEXT PRIMARY KEY,
  question_ids TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Daily challenge scores
CREATE TABLE IF NOT EXISTS daily_challenge_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  challenge_date TEXT NOT NULL,
  score INTEGER NOT NULL,
  time_taken REAL,
  correct_count INTEGER NOT NULL,
  submitted_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, challenge_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_scores_date ON daily_challenge_scores(challenge_date);
CREATE INDEX IF NOT EXISTS idx_daily_scores_user ON daily_challenge_scores(user_id);

-- Question version tracking (for client cache invalidation)
CREATE TABLE IF NOT EXISTS question_versions (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  version_hash TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO question_versions (id, version_hash) VALUES (1, 'v1.0.0-initial');
