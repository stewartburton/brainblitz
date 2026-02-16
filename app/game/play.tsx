// ============================================================
// Frenchie Trivia — Game Play Screen
// The core trivia gameplay experience with haptics & countdown
// ============================================================

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, SafeAreaView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/hooks/useGameStore';
import { QuestionCard } from '@/components/game/QuestionCard';
import { AnswerButton } from '@/components/game/AnswerButton';
import { TimerBar } from '@/components/game/TimerBar';
import { ScoreHUD } from '@/components/game/ScoreHUD';
import { FeedbackOverlay } from '@/components/game/FeedbackOverlay';
import { CountdownOverlay } from '@/components/game/CountdownOverlay';
import {
  hapticTap,
  hapticSuccess,
  hapticError,
  hapticWarning,
  hapticStreakCelebration,
} from '@/utils/haptics';
import { soundManager } from '@/utils/soundManager';

export default function PlayScreen() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastWarningTime = useRef<number>(999);
  const [showCountdown, setShowCountdown] = useState(true);

  const {
    phase,
    currentQuestion,
    currentRound,
    config,
    selectedAnswerIndex,
    score,
    streak,
    correctCount,
    timeLeft,
    feedbackMessage,
    lastScoreBreakdown,
    selectAnswer,
    tickTimer,
    nextRound,
    endGame,
    resetGame,
  } = useGameStore();

  // Timer tick every 100ms during playing phase
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        tickTimer();
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [phase]);

  // Haptic warning when timer hits 5s and 3s
  useEffect(() => {
    if (phase === 'playing') {
      if (timeLeft <= 3 && lastWarningTime.current > 3) {
        hapticWarning();
        soundManager.play('timer_warning');
      } else if (timeLeft <= 5 && lastWarningTime.current > 5) {
        hapticWarning();
      }
      lastWarningTime.current = timeLeft;
    } else {
      lastWarningTime.current = 999;
    }
  }, [timeLeft, phase]);

  // Haptic feedback on answer reveal
  useEffect(() => {
    if (phase === 'answered' && selectedAnswerIndex !== null && currentQuestion) {
      const isCorrect = selectedAnswerIndex === currentQuestion.correctIndex;
      if (isCorrect) {
        hapticSuccess();
        soundManager.play('correct');
        if (streak >= 5) {
          hapticStreakCelebration(streak);
          soundManager.play('mega_streak');
        } else if (streak >= 3) {
          soundManager.play('streak');
        }
      } else {
        hapticError();
        soundManager.play(selectedAnswerIndex === -1 ? 'timeout' : 'wrong');
      }
    }
  }, [phase]);

  // Navigate to results when game ends
  useEffect(() => {
    if (phase === 'results') {
      soundManager.play('game_over');
      router.replace('/game/results');
    }
  }, [phase]);

  const handleAnswer = useCallback(
    (index: number) => {
      if (phase === 'playing') {
        hapticTap();
        selectAnswer(index);
      }
    },
    [phase, selectAnswer]
  );

  const handleContinue = useCallback(() => {
    nextRound();
  }, [nextRound]);

  const handleQuit = useCallback(() => {
    resetGame();
    router.back();
  }, [resetGame, router]);

  // Countdown phase — show animated 3-2-1-🐾
  if (phase === 'countdown' || showCountdown) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#1A1035' }}>
        <CountdownOverlay
          onComplete={() => setShowCountdown(false)}
        />
      </SafeAreaView>
    );
  }

  // Error phase
  if (phase === 'error' || !currentQuestion) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#1A1035',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 32,
        }}
      >
        <Text style={{ fontSize: 48 }}>😕</Text>
        <Text
          style={{
            fontSize: 20,
            color: '#FFFFFF',
            fontWeight: '700',
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          No questions available
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          Try selecting a different category or check your connection.
        </Text>
        <Pressable
          onPress={handleQuit}
          style={{
            marginTop: 24,
            backgroundColor: '#6C5CE7',
            paddingHorizontal: 32,
            paddingVertical: 14,
            borderRadius: 14,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
            Go Back
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isRevealed = phase === 'answered' || phase === 'feedback';
  const isPlaying = phase === 'playing';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A1035' }}>
      {/* Score HUD */}
      <ScoreHUD
        score={score}
        streak={streak}
        correctCount={correctCount}
        currentRound={currentRound}
      />

      {/* Timer Bar */}
      <TimerBar
        timeLeft={timeLeft}
        totalTime={
          currentQuestion.difficulty === 'easy'
            ? 30
            : currentQuestion.difficulty === 'medium'
            ? 20
            : 15
        }
        isPaused={!isPlaying}
      />

      {/* Question Card */}
      <QuestionCard
        question={currentQuestion}
        roundNumber={currentRound}
        totalRounds={config.totalRounds}
      />

      {/* Answer Buttons */}
      <View style={{ flex: 1, paddingHorizontal: 16, justifyContent: 'center' }}>
        {currentQuestion.shuffledAnswers.map((answer, index) => (
          <AnswerButton
            key={`${currentQuestion.id}-${index}`}
            text={answer}
            index={index}
            isSelected={selectedAnswerIndex === index}
            isCorrect={index === currentQuestion.correctIndex}
            isRevealed={isRevealed}
            disabled={!isPlaying}
            onPress={handleAnswer}
          />
        ))}
      </View>

      {/* Quit button */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Pressable
          onPress={handleQuit}
          style={{ alignItems: 'center', padding: 12 }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            Quit Game
          </Text>
        </Pressable>
      </View>

      {/* Feedback Overlay */}
      {phase === 'feedback' && (
        <FeedbackOverlay
          message={feedbackMessage}
          isCorrect={
            selectedAnswerIndex !== null &&
            selectedAnswerIndex >= 0 &&
            selectedAnswerIndex === currentQuestion.correctIndex
          }
          scoreBreakdown={lastScoreBreakdown}
          explanation={currentQuestion.explanation}
          onContinue={handleContinue}
        />
      )}
    </SafeAreaView>
  );
}
