// ============================================================
// Frenchie Trivia — App Initialisation Hook
// Loads questions into the game store, manages loading state
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from './useGameStore';
import { loadQuestions, refreshQuestions } from '@/services/questionCache';

interface AppInitState {
  isLoading: boolean;
  questionsLoaded: number;
  error: string | null;
}

/**
 * Hook to initialise the app: load questions from cache/API
 * into the Zustand game store.
 *
 * Usage: call once in root layout or home screen.
 */
export function useAppInit() {
  const [state, setState] = useState<AppInitState>({
    isLoading: true,
    questionsLoaded: 0,
    error: null,
  });

  const setQuestionBank = useGameStore((s) => s.setQuestionBank);

  const init = useCallback(async () => {
    setState({ isLoading: true, questionsLoaded: 0, error: null });

    try {
      const questions = await loadQuestions();

      if (questions.length === 0) {
        setState({
          isLoading: false,
          questionsLoaded: 0,
          error: 'No questions available. Check your connection.',
        });
        return;
      }

      setQuestionBank(questions);
      setState({
        isLoading: false,
        questionsLoaded: questions.length,
        error: null,
      });
    } catch (err) {
      setState({
        isLoading: false,
        questionsLoaded: 0,
        error: 'Failed to load questions',
      });
    }
  }, [setQuestionBank]);

  const forceRefresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const questions = await refreshQuestions();
      setQuestionBank(questions);
      setState({
        isLoading: false,
        questionsLoaded: questions.length,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to refresh questions',
      }));
    }
  }, [setQuestionBank]);

  useEffect(() => {
    init();
  }, [init]);

  return {
    ...state,
    forceRefresh,
  };
}
