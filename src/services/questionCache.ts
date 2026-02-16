// ============================================================
// Frenchie Trivia — Question Cache
// Caches questions locally for offline play using AsyncStorage
// Only re-fetches when server version hash changes
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question } from '@/types';
import { api } from './api';
import { EMBEDDED_QUESTIONS } from '@/data/embeddedQuestions';
import { EMBEDDED_QUESTIONS } from '@/data/embeddedQuestions';

const CACHE_KEY_QUESTIONS = 'frenchie_questions';
const CACHE_KEY_VERSION = 'frenchie_questions_version';
const CACHE_KEY_TIMESTAMP = 'frenchie_questions_cached_at';

// Stale after 24 hours — will check for updates
const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

interface CachedData {
  questions: Question[];
  version: string;
  cachedAt: number;
}

/**
 * Load questions — tries cache first, falls back to API.
 * Only fetches from network if:
 *   1. No local cache exists
 *   2. Cache is stale (>24h old)
 *   3. Server version hash has changed
 */
export async function loadQuestions(): Promise<Question[]> {
  // Try local cache first
  const cached = await getCachedQuestions();

  if (cached && !isStale(cached.cachedAt)) {
    return cached.questions;
  }

  // Cache is stale or missing — check server version
  try {
    const versionResponse = await api.getQuestionsVersion();

    if (
      versionResponse.success &&
      versionResponse.data &&
      cached &&
      cached.version === versionResponse.data.version
    ) {
      // Same version — refresh timestamp only
      await AsyncStorage.setItem(
        CACHE_KEY_TIMESTAMP,
        String(Date.now())
      );
      return cached.questions;
    }

    // Version changed or no cache — fetch fresh questions
    const response = await api.getQuestions();

    if (response.success && response.data && response.data.length > 0) {
      await cacheQuestions(
        response.data,
        versionResponse.data?.version || 'unknown'
      );
      return response.data;
    }

    // API failed but we have cache — use it anyway
    if (cached) return cached.questions;

    // No cache and API failed — fall back to embedded questions
    return EMBEDDED_QUESTIONS;
  } catch (err) {
    // Network error — use cache if available, else embedded
    if (cached) return cached.questions;
    return EMBEDDED_QUESTIONS;
  }
}

/**
 * Force refresh questions from the API.
 */
export async function refreshQuestions(): Promise<Question[]> {
  const response = await api.getQuestions();

  if (response.success && response.data && response.data.length > 0) {
    const versionResponse = await api.getQuestionsVersion();
    await cacheQuestions(
      response.data,
      versionResponse.data?.version || 'unknown'
    );
    return response.data;
  }

  throw new Error(response.error?.message || 'Failed to fetch questions');
}

/**
 * Get cached question count (for display).
 */
export async function getCachedQuestionCount(): Promise<number> {
  const cached = await getCachedQuestions();
  return cached?.questions.length || 0;
}

/**
 * Clear all cached question data.
 */
export async function clearQuestionCache(): Promise<void> {
  await AsyncStorage.multiRemove([
    CACHE_KEY_QUESTIONS,
    CACHE_KEY_VERSION,
    CACHE_KEY_TIMESTAMP,
  ]);
}

// --- Internal helpers ---

async function getCachedQuestions(): Promise<CachedData | null> {
  try {
    const [questionsStr, version, timestampStr] = await AsyncStorage.multiGet([
      CACHE_KEY_QUESTIONS,
      CACHE_KEY_VERSION,
      CACHE_KEY_TIMESTAMP,
    ]);

    if (!questionsStr[1] || !version[1] || !timestampStr[1]) {
      return null;
    }

    return {
      questions: JSON.parse(questionsStr[1]),
      version: version[1],
      cachedAt: parseInt(timestampStr[1], 10),
    };
  } catch {
    return null;
  }
}

async function cacheQuestions(
  questions: Question[],
  version: string
): Promise<void> {
  try {
    await AsyncStorage.multiSet([
      [CACHE_KEY_QUESTIONS, JSON.stringify(questions)],
      [CACHE_KEY_VERSION, version],
      [CACHE_KEY_TIMESTAMP, String(Date.now())],
    ]);
  } catch (err) {
    console.warn('Failed to cache questions:', err);
  }
}

function isStale(cachedAt: number): boolean {
  return Date.now() - cachedAt > STALE_AFTER_MS;
}
