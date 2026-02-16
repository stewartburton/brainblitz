// ============================================================
// Frenchie Trivia — API Service
// Communicates with Cloudflare Workers backend
// ============================================================

import { ApiResponse, Question, LeaderboardEntry, GameResult, User } from '@/types';
import { API_BASE_URL } from '@/utils/constants';

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          data: null,
          error: {
            code: data.error?.code || 'UNKNOWN',
            message: data.error?.message || 'Request failed',
          },
        };
      }

      return { success: true, data: data.data || data };
    } catch (err) {
      return {
        success: false,
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  // --- Auth ---

  async createGuestAccount(deviceId: string, displayName: string) {
    return this.request<{ user: User; token: string }>('/auth/guest', {
      method: 'POST',
      body: JSON.stringify({ deviceId, displayName }),
    });
  }

  async refreshToken() {
    return this.request<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });
  }

  // --- Questions ---

  async getQuestionsVersion(): Promise<ApiResponse<{ version: string }>> {
    return this.request('/questions/version');
  }

  async getQuestions(category?: string): Promise<ApiResponse<Question[]>> {
    const params = category ? `?category=${category}` : '';
    return this.request(`/questions${params}`);
  }

  // --- Scores ---

  async submitScore(result: GameResult): Promise<ApiResponse<{
    rank: number;
    newAchievements: string[];
    xpEarned: number;
  }>> {
    return this.request('/scores', {
      method: 'POST',
      body: JSON.stringify(result),
    });
  }

  async getMyScores(
    limit: number = 20,
    offset: number = 0
  ): Promise<ApiResponse<GameResult[]>> {
    return this.request(`/scores/me?limit=${limit}&offset=${offset}`);
  }

  // --- Leaderboard ---

  async getLeaderboard(
    period: 'alltime' | 'weekly' | 'monthly' = 'alltime',
    limit: number = 100
  ): Promise<ApiResponse<LeaderboardEntry[]>> {
    return this.request(`/leaderboard/${period}?limit=${limit}`);
  }

  async getMyRank(
    period: 'alltime' | 'weekly' | 'monthly' = 'alltime'
  ): Promise<ApiResponse<{ rank: number; score: number }>> {
    return this.request(`/leaderboard/${period}/me`);
  }

  // --- Profile ---

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request('/profile');
  }

  async updateProfile(updates: {
    displayName?: string;
    avatarId?: string;
  }): Promise<ApiResponse<User>> {
    return this.request('/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // --- Achievements ---

  async getAchievements(): Promise<ApiResponse<{
    earned: string[];
    all: { id: string; name: string; description: string; icon: string }[];
  }>> {
    return this.request('/achievements');
  }

  // --- Daily Challenge ---

  async getDailyChallenge(): Promise<ApiResponse<{
    date: string;
    questions: Question[];
  }>> {
    return this.request('/daily-challenge');
  }

  async submitDailyChallengeScore(
    score: number,
    timeTaken: number,
    correctCount: number
  ): Promise<ApiResponse<{ rank: number }>> {
    return this.request('/daily-challenge/score', {
      method: 'POST',
      body: JSON.stringify({ score, timeTaken, correctCount }),
    });
  }
}

// Singleton instance
export const api = new ApiService();
