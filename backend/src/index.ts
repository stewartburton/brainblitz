// ============================================================
// Frenchie Trivia — Cloudflare Worker API
// Hono.js-based REST API with D1, KV, and Upstash Redis
// ============================================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import jwt from '@tsndr/cloudflare-worker-jwt';
import { Redis } from '@upstash/redis/cloudflare';

// --- Types ---

interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  AUDIO: R2Bucket;
  JWT_SECRET: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  CORS_ORIGIN: string;
  ENVIRONMENT: string;
}

interface UserRow {
  id: string;
  device_id: string;
  display_name: string;
  avatar_id: string;
  auth_provider: string;
  level: number;
  total_xp: number;
  total_games: number;
  total_correct: number;
  total_score: number;
  best_game_score: number;
  best_streak: number;
  is_premium: number;
}

interface QuestionRow {
  id: number;
  category: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answer_1: string;
  incorrect_answer_2: string;
  incorrect_answer_3: string | null;
  explanation: string | null;
  fun_fact: string | null;
  is_premium: number;
}

// --- App ---

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors());

// --- Helper: Generate UUID ---
function generateId(): string {
  return crypto.randomUUID();
}

// --- Helper: Create JWT ---
async function createToken(userId: string, secret: string): Promise<string> {
  return jwt.sign(
    {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    },
    secret
  );
}

// --- Helper: Verify JWT ---
async function verifyToken(
  token: string,
  secret: string
): Promise<string | null> {
  try {
    const isValid = await jwt.verify(token, secret);
    if (!isValid) return null;
    const decoded = jwt.decode(token);
    return decoded.payload?.sub as string || null;
  } catch {
    return null;
  }
}

// --- Helper: Auth middleware ---
async function requireAuth(
  c: any
): Promise<{ userId: string } | Response> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing auth token' } }, 401);
  }

  const token = authHeader.slice(7);
  const userId = await verifyToken(token, c.env.JWT_SECRET);
  if (!userId) {
    return c.json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } }, 401);
  }

  return { userId };
}

// --- Helper: Get Redis client ---
function getRedis(env: Env): Redis {
  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// ============================================================
// ROUTES
// ============================================================

// --- Health Check ---
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'frenchie-trivia-api', timestamp: new Date().toISOString() });
});

// --- AUTH: Create Guest Account ---
app.post('/auth/guest', async (c) => {
  const body = await c.req.json();
  const { deviceId, displayName } = body;

  if (!deviceId || !displayName) {
    return c.json({ success: false, error: { code: 'BAD_REQUEST', message: 'deviceId and displayName required' } }, 400);
  }

  // Check if device already has an account
  const existing = await c.env.DB.prepare(
    'SELECT * FROM users WHERE device_id = ?'
  ).bind(deviceId).first<UserRow>();

  if (existing) {
    const token = await createToken(existing.id, c.env.JWT_SECRET);
    return c.json({ success: true, data: { user: existing, token } });
  }

  // Create new guest user
  const userId = generateId();
  await c.env.DB.prepare(
    `INSERT INTO users (id, device_id, display_name, auth_provider)
     VALUES (?, ?, ?, 'anonymous')`
  ).bind(userId, deviceId, displayName).run();

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(userId).first<UserRow>();

  const token = await createToken(userId, c.env.JWT_SECRET);

  return c.json({ success: true, data: { user, token } });
});

// --- QUESTIONS: Get version hash ---
app.get('/questions/version', async (c) => {
  const row = await c.env.DB.prepare(
    'SELECT version_hash FROM question_versions WHERE id = 1'
  ).first<{ version_hash: string }>();

  return c.json({ success: true, data: { version: row?.version_hash || 'unknown' } });
});

// --- QUESTIONS: Get all questions ---
app.get('/questions', async (c) => {
  const category = c.req.query('category');
  const difficulty = c.req.query('difficulty');

  let query = 'SELECT * FROM questions WHERE is_active = 1';
  const params: string[] = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (difficulty) {
    query += ' AND difficulty = ?';
    params.push(difficulty);
  }

  const stmt = c.env.DB.prepare(query);
  const bound = params.length > 0 ? stmt.bind(...params) : stmt;
  const { results } = await bound.all<QuestionRow>();

  // Transform to API format
  const questions = (results || []).map((q) => ({
    id: String(q.id),
    category: q.category,
    difficulty: q.difficulty,
    question: q.question,
    correctAnswer: q.correct_answer,
    incorrectAnswers: [
      q.incorrect_answer_1,
      q.incorrect_answer_2,
      q.incorrect_answer_3,
    ].filter(Boolean),
    explanation: q.explanation,
    funFact: q.fun_fact,
    isPremium: q.is_premium === 1,
  }));

  return c.json({ success: true, data: questions });
});

// --- SCORES: Submit game result ---
app.post('/scores', async (c) => {
  const auth = await requireAuth(c);
  if (auth instanceof Response) return auth;

  const body = await c.req.json();
  const { mode, category, difficulty, totalRounds, correctCount, score, bestStreak, averageTimePerQuestion } = body;

  const sessionId = generateId();

  // Insert game session
  await c.env.DB.prepare(
    `INSERT INTO game_sessions (id, user_id, mode, category, difficulty, total_rounds, correct_count, score, best_streak, average_time)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(sessionId, auth.userId, mode, category, difficulty, totalRounds, correctCount, score, bestStreak, averageTimePerQuestion).run();

  // Update user stats
  await c.env.DB.prepare(
    `UPDATE users SET
       total_games = total_games + 1,
       total_correct = total_correct + ?,
       total_score = total_score + ?,
       total_xp = total_xp + ?,
       best_game_score = MAX(best_game_score, ?),
       best_streak = MAX(best_streak, ?),
       last_played_at = datetime('now'),
       updated_at = datetime('now')
     WHERE id = ?`
  ).bind(correctCount, score, score, score, bestStreak, auth.userId).run();

  // Update leaderboard in Redis (if ranked mode)
  if (mode === 'ranked') {
    try {
      const redis = getRedis(c.env);
      await redis.zincrby('lb:alltime', score, auth.userId);

      // Weekly leaderboard
      const weekKey = `lb:weekly:${getWeekKey()}`;
      await redis.zincrby(weekKey, score, auth.userId);
      await redis.expire(weekKey, 8 * 24 * 60 * 60);

      // Monthly leaderboard
      const monthKey = `lb:monthly:${getMonthKey()}`;
      await redis.zincrby(monthKey, score, auth.userId);
      await redis.expire(monthKey, 32 * 24 * 60 * 60);
    } catch (err) {
      // Redis errors shouldn't fail the request
      console.error('Redis error:', err);
    }
  }

  // Get user's new rank
  let rank = null;
  try {
    const redis = getRedis(c.env);
    const r = await redis.zrevrank('lb:alltime', auth.userId);
    rank = r !== null ? r + 1 : null;
  } catch {}

  return c.json({
    success: true,
    data: {
      sessionId,
      rank,
      xpEarned: score,
      newAchievements: [], // TODO: check achievements
    },
  });
});

// --- LEADERBOARD: Get rankings ---
app.get('/leaderboard/:period', async (c) => {
  const period = c.req.param('period');
  const limit = parseInt(c.req.query('limit') || '100');

  let redisKey: string;
  switch (period) {
    case 'weekly':
      redisKey = `lb:weekly:${getWeekKey()}`;
      break;
    case 'monthly':
      redisKey = `lb:monthly:${getMonthKey()}`;
      break;
    default:
      redisKey = 'lb:alltime';
  }

  try {
    const redis = getRedis(c.env);
    const results = await redis.zrevrange(redisKey, 0, limit - 1, { withScores: true });

    if (!results || results.length === 0) {
      return c.json({ success: true, data: [] });
    }

    // Results come as [member, score, member, score, ...]
    const entries: { userId: string; score: number; rank: number }[] = [];
    for (let i = 0; i < results.length; i += 2) {
      entries.push({
        userId: results[i] as string,
        score: results[i + 1] as number,
        rank: Math.floor(i / 2) + 1,
      });
    }

    // Fetch user profiles for the leaderboard entries
    if (entries.length > 0) {
      const userIds = entries.map((e) => e.userId);
      const placeholders = userIds.map(() => '?').join(',');
      const { results: users } = await c.env.DB.prepare(
        `SELECT id, display_name, avatar_id, level FROM users WHERE id IN (${placeholders})`
      ).bind(...userIds).all<{ id: string; display_name: string; avatar_id: string; level: number }>();

      const userMap = new Map((users || []).map((u) => [u.id, u]));

      const enrichedEntries = entries.map((e) => {
        const user = userMap.get(e.userId);
        return {
          userId: e.userId,
          displayName: user?.display_name || 'Unknown',
          avatarId: user?.avatar_id || 'fawn',
          level: user?.level || 1,
          score: e.score,
          rank: e.rank,
        };
      });

      return c.json({ success: true, data: enrichedEntries });
    }

    return c.json({ success: true, data: entries });
  } catch (err) {
    return c.json({ success: false, error: { code: 'LEADERBOARD_ERROR', message: 'Failed to fetch leaderboard' } }, 500);
  }
});

// --- LEADERBOARD: Get user's rank ---
app.get('/leaderboard/:period/me', async (c) => {
  const auth = await requireAuth(c);
  if (auth instanceof Response) return auth;

  const period = c.req.param('period');
  let redisKey = 'lb:alltime';
  if (period === 'weekly') redisKey = `lb:weekly:${getWeekKey()}`;
  if (period === 'monthly') redisKey = `lb:monthly:${getMonthKey()}`;

  try {
    const redis = getRedis(c.env);
    const rank = await redis.zrevrank(redisKey, auth.userId);
    const score = await redis.zscore(redisKey, auth.userId);

    return c.json({
      success: true,
      data: {
        rank: rank !== null ? rank + 1 : null,
        score: score || 0,
      },
    });
  } catch {
    return c.json({ success: true, data: { rank: null, score: 0 } });
  }
});

// --- PROFILE: Get current user ---
app.get('/profile', async (c) => {
  const auth = await requireAuth(c);
  if (auth instanceof Response) return auth;

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(auth.userId).first<UserRow>();

  if (!user) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, 404);
  }

  return c.json({ success: true, data: user });
});

// --- PROFILE: Update profile ---
app.patch('/profile', async (c) => {
  const auth = await requireAuth(c);
  if (auth instanceof Response) return auth;

  const body = await c.req.json();
  const updates: string[] = [];
  const params: any[] = [];

  if (body.displayName) {
    if (body.displayName.length < 3 || body.displayName.length > 20) {
      return c.json({ success: false, error: { code: 'INVALID_NAME', message: 'Name must be 3-20 characters' } }, 400);
    }
    updates.push('display_name = ?');
    params.push(body.displayName);
  }

  if (body.avatarId) {
    updates.push('avatar_id = ?');
    params.push(body.avatarId);
  }

  if (updates.length === 0) {
    return c.json({ success: false, error: { code: 'NO_UPDATES', message: 'No fields to update' } }, 400);
  }

  updates.push("updated_at = datetime('now')");
  params.push(auth.userId);

  await c.env.DB.prepare(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...params).run();

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(auth.userId).first<UserRow>();

  return c.json({ success: true, data: user });
});

// --- DAILY CHALLENGE: Get today's challenge ---
app.get('/daily-challenge', async (c) => {
  const today = getTodayKey();

  // Check if daily challenge exists for today
  let challengeRow = await c.env.DB.prepare(
    'SELECT question_ids FROM daily_challenges WHERE date = ?'
  ).bind(today).first<{ question_ids: string }>();

  if (!challengeRow) {
    // Generate today's challenge: 10 random mixed-difficulty questions
    const { results: allQuestions } = await c.env.DB.prepare(
      'SELECT id, difficulty FROM questions WHERE is_active = 1 ORDER BY RANDOM() LIMIT 30'
    ).all<{ id: number; difficulty: string }>();

    if (!allQuestions || allQuestions.length < 10) {
      return c.json({ success: false, error: { code: 'NO_QUESTIONS', message: 'Not enough questions for daily challenge' } }, 500);
    }

    // Pick 3 easy, 4 medium, 3 hard
    const easy = allQuestions.filter(q => q.difficulty === 'easy').slice(0, 3);
    const medium = allQuestions.filter(q => q.difficulty === 'medium').slice(0, 4);
    const hard = allQuestions.filter(q => q.difficulty === 'hard').slice(0, 3);
    let selected = [...easy, ...medium, ...hard];

    // Fill if we don't have enough of each difficulty
    if (selected.length < 10) {
      const remaining = allQuestions.filter(q => !selected.includes(q));
      selected.push(...remaining.slice(0, 10 - selected.length));
    }

    const questionIds = selected.slice(0, 10).map(q => q.id);

    await c.env.DB.prepare(
      'INSERT INTO daily_challenges (date, question_ids) VALUES (?, ?)'
    ).bind(today, JSON.stringify(questionIds)).run();

    challengeRow = { question_ids: JSON.stringify(questionIds) };
  }

  // Fetch the full questions
  const questionIds: number[] = JSON.parse(challengeRow.question_ids);
  const placeholders = questionIds.map(() => '?').join(',');
  const { results: questions } = await c.env.DB.prepare(
    `SELECT * FROM questions WHERE id IN (${placeholders})`
  ).bind(...questionIds).all<QuestionRow>();

  // Sort questions to match the original order
  const idOrder = new Map(questionIds.map((id, i) => [id, i]));
  const sorted = (questions || []).sort((a, b) => (idOrder.get(a.id) || 0) - (idOrder.get(b.id) || 0));

  const formatted = sorted.map(q => ({
    id: String(q.id),
    category: q.category,
    difficulty: q.difficulty,
    question: q.question,
    correctAnswer: q.correct_answer,
    incorrectAnswers: [q.incorrect_answer_1, q.incorrect_answer_2, q.incorrect_answer_3].filter(Boolean),
    explanation: q.explanation,
    funFact: q.fun_fact,
    isPremium: false,
  }));

  return c.json({ success: true, data: { date: today, questions: formatted } });
});

// --- DAILY CHALLENGE: Submit score ---
app.post('/daily-challenge/score', async (c) => {
  const auth = await requireAuth(c);
  if (auth instanceof Response) return auth;

  const { score, timeTaken, correctCount } = await c.req.json();
  const today = getTodayKey();

  // Check if already submitted today
  const existing = await c.env.DB.prepare(
    'SELECT id FROM daily_challenge_scores WHERE user_id = ? AND challenge_date = ?'
  ).bind(auth.userId, today).first();

  if (existing) {
    return c.json({ success: false, error: { code: 'ALREADY_PLAYED', message: 'You already completed today\'s challenge' } }, 409);
  }

  // Insert score
  await c.env.DB.prepare(
    'INSERT INTO daily_challenge_scores (user_id, challenge_date, score, time_taken, correct_count) VALUES (?, ?, ?, ?, ?)'
  ).bind(auth.userId, today, score, timeTaken, correctCount).run();

  // Update Redis daily leaderboard
  try {
    const redis = getRedis(c.env);
    await redis.zadd(`lb:daily:${today}`, { score, member: auth.userId });
    await redis.expire(`lb:daily:${today}`, 2 * 24 * 60 * 60); // 2 days TTL

    const rank = await redis.zrevrank(`lb:daily:${today}`, auth.userId);
    return c.json({ success: true, data: { rank: rank !== null ? rank + 1 : null } });
  } catch {
    return c.json({ success: true, data: { rank: null } });
  }
});

// --- ACHIEVEMENTS: Get user achievements ---
app.get('/achievements', async (c) => {
  const auth = await requireAuth(c);
  if (auth instanceof Response) return auth;

  const { results: allAchievements } = await c.env.DB.prepare(
    'SELECT * FROM achievements ORDER BY category'
  ).all<{ id: string; name: string; description: string; icon: string; category: string; is_secret: number }>();

  const { results: earned } = await c.env.DB.prepare(
    'SELECT achievement_id, earned_at FROM user_achievements WHERE user_id = ?'
  ).bind(auth.userId).all<{ achievement_id: string; earned_at: string }>();

  const earnedMap = new Map((earned || []).map(e => [e.achievement_id, e.earned_at]));

  const achievements = (allAchievements || []).map(a => ({
    id: a.id,
    name: a.name,
    description: a.description,
    icon: a.icon,
    category: a.category,
    isSecret: a.is_secret === 1,
    earnedAt: earnedMap.get(a.id) || null,
    isEarned: earnedMap.has(a.id),
  }));

  return c.json({
    success: true,
    data: {
      total: allAchievements?.length || 0,
      earned: earned?.length || 0,
      achievements,
    },
  });
});

// --- ACHIEVEMENTS: Award achievement ---
app.post('/achievements', async (c) => {
  const auth = await requireAuth(c);
  if (auth instanceof Response) return auth;

  const { achievementIds } = await c.req.json();
  if (!Array.isArray(achievementIds) || achievementIds.length === 0) {
    return c.json({ success: true, data: { awarded: [] } });
  }

  const awarded: string[] = [];

  for (const achievementId of achievementIds) {
    try {
      await c.env.DB.prepare(
        'INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)'
      ).bind(auth.userId, achievementId).run();
      awarded.push(achievementId);
    } catch {}
  }

  return c.json({ success: true, data: { awarded } });
});

// --- Helpers ---

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function getWeekKey(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return `${now.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

function getMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

// --- Export ---

export default app;
