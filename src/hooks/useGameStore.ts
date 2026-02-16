// ============================================================
// Frenchie Trivia — Game Store (Zustand)
// Core game state machine driving the trivia experience
// ============================================================

import { create } from 'zustand';
import {
  GamePhase,
  GameConfig,
  GameState,
  GameResult,
  ShuffledQuestion,
  Question,
  RoundResult,
  Difficulty,
  Category,
} from '@/types';
import { calculateScore, ScoreBreakdown } from '@/utils/scoring';
import {
  DEFAULT_GAME_CONFIG,
  DIFFICULTY_CONFIG,
  pickRandom,
  FEEDBACK_CORRECT,
  FEEDBACK_WRONG,
  FEEDBACK_TIMEOUT,
  FEEDBACK_STREAK,
  FEEDBACK_MEGA_STREAK,
} from '@/utils/constants';

// --- Helpers ---

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function prepareQuestion(q: Question): ShuffledQuestion {
  const allAnswers = [q.correctAnswer, ...q.incorrectAnswers];
  const shuffled = shuffleArray(allAnswers);
  return {
    ...q,
    shuffledAnswers: shuffled,
    correctIndex: shuffled.indexOf(q.correctAnswer),
  };
}

function getTimerForDifficulty(difficulty: Difficulty | 'mixed'): number {
  if (difficulty === 'mixed') return 20;
  return DIFFICULTY_CONFIG[difficulty].timerSeconds;
}

function selectQuestionsForGame(
  allQuestions: Question[],
  config: GameConfig
): Question[] {
  let pool = [...allQuestions];

  // Filter by category
  if (config.category !== 'all') {
    pool = pool.filter((q) => q.category === config.category);
  }

  // Filter by difficulty
  if (config.difficulty !== 'mixed') {
    pool = pool.filter((q) => q.difficulty === config.difficulty);
  }

  // Shuffle the pool
  pool = shuffleArray(pool);

  // If mixed difficulty, distribute: first third easy, middle medium, last hard
  if (config.difficulty === 'mixed' && pool.length >= config.totalRounds) {
    const easy = pool.filter((q) => q.difficulty === 'easy');
    const medium = pool.filter((q) => q.difficulty === 'medium');
    const hard = pool.filter((q) => q.difficulty === 'hard');

    const easyCount = Math.ceil(config.totalRounds * 0.3);
    const hardCount = Math.ceil(config.totalRounds * 0.3);
    const mediumCount = config.totalRounds - easyCount - hardCount;

    const selected = [
      ...shuffleArray(easy).slice(0, easyCount),
      ...shuffleArray(medium).slice(0, mediumCount),
      ...shuffleArray(hard).slice(0, hardCount),
    ];

    // If we don't have enough of each difficulty, fill from the full pool
    if (selected.length < config.totalRounds) {
      const remaining = pool.filter((q) => !selected.includes(q));
      selected.push(
        ...remaining.slice(0, config.totalRounds - selected.length)
      );
    }

    return selected.slice(0, config.totalRounds);
  }

  return pool.slice(0, config.totalRounds);
}

// --- Store Interface ---

interface GameStore extends GameState {
  // Available questions (loaded from API/cache)
  questionBank: Question[];
  gameQuestions: ShuffledQuestion[];

  // Feedback display
  feedbackMessage: string;
  lastScoreBreakdown: ScoreBreakdown | null;

  // Timer
  timerInterval: ReturnType<typeof setInterval> | null;

  // Actions
  setQuestionBank: (questions: Question[]) => void;
  startGame: (config?: Partial<GameConfig>) => void;
  selectAnswer: (answerIndex: number) => void;
  handleTimeout: () => void;
  nextRound: () => void;
  tickTimer: () => void;
  endGame: () => GameResult | null;
  resetGame: () => void;
}

const INITIAL_STATE: GameState = {
  phase: 'idle',
  config: DEFAULT_GAME_CONFIG,
  currentRound: 0,
  currentQuestion: null,
  selectedAnswerIndex: null,
  score: 0,
  streak: 0,
  bestStreak: 0,
  correctCount: 0,
  timeLeft: 0,
  roundResults: [],
  startedAt: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...INITIAL_STATE,
  questionBank: [],
  gameQuestions: [],
  feedbackMessage: '',
  lastScoreBreakdown: null,
  timerInterval: null,

  setQuestionBank: (questions: Question[]) => {
    set({ questionBank: questions });
  },

  startGame: (configOverrides?: Partial<GameConfig>) => {
    const state = get();
    const config = { ...DEFAULT_GAME_CONFIG, ...configOverrides };

    // Select and prepare questions
    const selected = selectQuestionsForGame(state.questionBank, config);

    if (selected.length === 0) {
      set({ phase: 'error', feedbackMessage: 'No questions available!' });
      return;
    }

    // Adjust rounds if not enough questions
    const actualRounds = Math.min(config.totalRounds, selected.length);
    const prepared = selected.map(prepareQuestion);

    const firstQuestion = prepared[0];
    const timerDuration = firstQuestion
      ? getTimerForDifficulty(firstQuestion.difficulty)
      : config.timerDuration;

    set({
      phase: 'countdown',
      config: { ...config, totalRounds: actualRounds },
      gameQuestions: prepared,
      currentRound: 1,
      currentQuestion: firstQuestion,
      selectedAnswerIndex: null,
      score: 0,
      streak: 0,
      bestStreak: 0,
      correctCount: 0,
      timeLeft: timerDuration,
      roundResults: [],
      feedbackMessage: '',
      lastScoreBreakdown: null,
      startedAt: Date.now(),
    });

    // After countdown (3 seconds), start playing
    setTimeout(() => {
      set({ phase: 'playing' });
    }, 3000);
  },

  selectAnswer: (answerIndex: number) => {
    const state = get();
    if (state.phase !== 'playing' || state.selectedAnswerIndex !== null) return;

    const question = state.currentQuestion;
    if (!question) return;

    const isCorrect = answerIndex === question.correctIndex;
    const timeSpent =
      getTimerForDifficulty(question.difficulty) - state.timeLeft;

    // Calculate score
    const breakdown = calculateScore({
      isCorrect,
      timeLeft: state.timeLeft,
      timerDuration: getTimerForDifficulty(question.difficulty),
      currentStreak: isCorrect ? state.streak + 1 : 0,
      difficulty: question.difficulty,
    });

    const newStreak = isCorrect ? state.streak + 1 : 0;
    const newBestStreak = Math.max(state.bestStreak, newStreak);

    // Pick feedback message
    let feedback: string;
    if (!isCorrect) {
      feedback = pickRandom(FEEDBACK_WRONG);
    } else if (newStreak >= 5) {
      feedback = pickRandom(FEEDBACK_MEGA_STREAK);
    } else if (newStreak >= 3) {
      feedback = pickRandom(FEEDBACK_STREAK);
    } else {
      feedback = pickRandom(FEEDBACK_CORRECT);
    }

    const roundResult: RoundResult = {
      questionId: question.id,
      selectedAnswer: question.shuffledAnswers[answerIndex],
      correctAnswer: question.correctAnswer,
      isCorrect,
      timeSpent,
      pointsEarned: breakdown.total,
      speedBonus: breakdown.speed,
      streakBonus: breakdown.streak,
    };

    set({
      phase: 'answered',
      selectedAnswerIndex: answerIndex,
      score: state.score + breakdown.total,
      streak: newStreak,
      bestStreak: newBestStreak,
      correctCount: state.correctCount + (isCorrect ? 1 : 0),
      feedbackMessage: feedback,
      lastScoreBreakdown: breakdown,
      roundResults: [...state.roundResults, roundResult],
    });

    // Show feedback, then move to reveal phase
    setTimeout(() => {
      set({ phase: 'feedback' });
    }, 300);
  },

  handleTimeout: () => {
    const state = get();
    if (state.phase !== 'playing') return;

    const question = state.currentQuestion;
    if (!question) return;

    const roundResult: RoundResult = {
      questionId: question.id,
      selectedAnswer: null,
      correctAnswer: question.correctAnswer,
      isCorrect: false,
      timeSpent: getTimerForDifficulty(question.difficulty),
      pointsEarned: 0,
      speedBonus: 0,
      streakBonus: 0,
    };

    set({
      phase: 'answered',
      selectedAnswerIndex: -1, // indicates timeout
      streak: 0,
      feedbackMessage: pickRandom(FEEDBACK_TIMEOUT),
      lastScoreBreakdown: null,
      roundResults: [...state.roundResults, roundResult],
    });

    setTimeout(() => {
      set({ phase: 'feedback' });
    }, 300);
  },

  nextRound: () => {
    const state = get();
    const nextRoundNum = state.currentRound + 1;

    // Check if game is over
    if (nextRoundNum > state.config.totalRounds) {
      set({ phase: 'results' });
      return;
    }

    const nextQuestion = state.gameQuestions[nextRoundNum - 1];
    if (!nextQuestion) {
      set({ phase: 'results' });
      return;
    }

    const timerDuration = getTimerForDifficulty(nextQuestion.difficulty);

    set({
      phase: 'between_rounds',
      currentRound: nextRoundNum,
      currentQuestion: nextQuestion,
      selectedAnswerIndex: null,
      timeLeft: timerDuration,
      feedbackMessage: '',
      lastScoreBreakdown: null,
    });

    // Brief pause between rounds
    setTimeout(() => {
      set({ phase: 'playing' });
    }, 1000);
  },

  tickTimer: () => {
    const state = get();
    if (state.phase !== 'playing') return;

    const newTimeLeft = Math.max(0, state.timeLeft - 0.1);
    set({ timeLeft: newTimeLeft });

    if (newTimeLeft <= 0) {
      state.handleTimeout();
    }
  },

  endGame: (): GameResult | null => {
    const state = get();
    if (state.roundResults.length === 0) return null;

    const totalTime = state.roundResults.reduce(
      (sum, r) => sum + r.timeSpent,
      0
    );

    return {
      sessionId: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: '', // filled by the caller
      mode: state.config.mode,
      category: state.config.category,
      difficulty: state.config.difficulty,
      totalRounds: state.config.totalRounds,
      correctCount: state.correctCount,
      score: state.score,
      bestStreak: state.bestStreak,
      averageTimePerQuestion: totalTime / state.roundResults.length,
      totalTimeTaken: totalTime,
      roundResults: state.roundResults,
      completedAt: new Date().toISOString(),
    };
  },

  resetGame: () => {
    const state = get();
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }
    set({
      ...INITIAL_STATE,
      questionBank: state.questionBank,
      gameQuestions: [],
      feedbackMessage: '',
      lastScoreBreakdown: null,
      timerInterval: null,
    });
  },
}));
