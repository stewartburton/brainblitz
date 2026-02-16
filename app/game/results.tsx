// ============================================================
// Frenchie Trivia — Game Results Screen
// Post-game summary with score breakdown, stats, and sharing
// ============================================================

import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/hooks/useGameStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { formatScore, calculateAccuracy, formatTime } from '@/utils/scoring';

export default function ResultsScreen() {
  const router = useRouter();
  const { score, correctCount, bestStreak, config, roundResults, endGame, resetGame } =
    useGameStore();
  const { user } = useAuthStore();

  const result = useMemo(() => endGame(), []);

  const accuracy = calculateAccuracy(correctCount, config.totalRounds);
  const totalTime = roundResults.reduce((sum, r) => sum + r.timeSpent, 0);
  const avgTime = roundResults.length > 0 ? totalTime / roundResults.length : 0;

  const getGradeEmoji = () => {
    if (accuracy >= 90) return '🏆';
    if (accuracy >= 70) return '🌟';
    if (accuracy >= 50) return '👍';
    return '💪';
  };

  const getGradeMessage = () => {
    if (accuracy >= 90) return 'Frenchie Champion!';
    if (accuracy >= 70) return 'Great job, expert!';
    if (accuracy >= 50) return 'Not bad, keep learning!';
    return 'Practice makes pawfect!';
  };

  const handlePlayAgain = () => {
    resetGame();
    router.replace('/');
  };

  const handleViewLeaderboard = () => {
    resetGame();
    router.replace('/leaderboard');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A1035' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 24 }}>
          <Text style={{ fontSize: 64 }}>{getGradeEmoji()}</Text>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: '#FFFFFF',
              marginTop: 12,
            }}
          >
            {getGradeMessage()}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.5)',
              marginTop: 6,
            }}
          >
            {config.mode === 'ranked' ? 'Ranked Game' : 'Casual Game'} •{' '}
            {config.totalRounds} Questions
          </Text>
        </View>

        {/* Score Card */}
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: 'rgba(30, 20, 60, 0.85)',
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: 'rgba(108, 92, 231, 0.3)',
            marginBottom: 16,
          }}
        >
          {/* Big Score */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              FINAL SCORE
            </Text>
            <Text
              style={{
                color: '#6C5CE7',
                fontSize: 48,
                fontWeight: '900',
                marginTop: 4,
              }}
            >
              {formatScore(score)}
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <StatBox
              label="Accuracy"
              value={`${accuracy}%`}
              color="#00B894"
            />
            <StatBox
              label="Best Streak"
              value={`${bestStreak}x`}
              color="#FDCB6E"
            />
            <StatBox
              label="Correct"
              value={`${correctCount}/${config.totalRounds}`}
              color="#00CEC9"
            />
            <StatBox
              label="Avg Time"
              value={formatTime(avgTime)}
              color="#FDA085"
            />
          </View>
        </View>

        {/* Round-by-Round Breakdown */}
        <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
          <Text
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 13,
              fontWeight: '600',
              marginBottom: 10,
              letterSpacing: 1,
            }}
          >
            ROUND BREAKDOWN
          </Text>
          {roundResults.map((r, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.05)',
              }}
            >
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, width: 30 }}>
                #{i + 1}
              </Text>
              <Text style={{ fontSize: 18, width: 30 }}>
                {r.isCorrect ? '✅' : r.selectedAnswer === null ? '⏰' : '❌'}
              </Text>
              <Text
                style={{
                  color: r.isCorrect ? '#00B894' : '#E17055',
                  fontSize: 15,
                  fontWeight: '700',
                  flex: 1,
                }}
              >
                {r.isCorrect
                  ? `+${r.pointsEarned}`
                  : r.selectedAnswer === null
                  ? 'Timeout'
                  : 'Wrong'}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                {r.timeSpent.toFixed(1)}s
              </Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <Pressable
            onPress={handlePlayAgain}
            style={{
              backgroundColor: '#6C5CE7',
              borderRadius: 16,
              padding: 18,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
              🐾 Play Again
            </Text>
          </Pressable>

          {config.mode === 'ranked' && (
            <Pressable
              onPress={handleViewLeaderboard}
              style={{
                backgroundColor: 'rgba(30, 20, 60, 0.85)',
                borderRadius: 16,
                padding: 18,
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: '#FDA085',
              }}
            >
              <Text style={{ color: '#FDA085', fontSize: 18, fontWeight: '700' }}>
                🏆 View Leaderboard
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => {
              resetGame();
              router.replace('/');
            }}
            style={{ alignItems: 'center', padding: 14 }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>
              Back to Home
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Helper Component ---

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View
      style={{
        width: '50%',
        padding: 12,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
        {label}
      </Text>
      <Text
        style={{
          color,
          fontSize: 24,
          fontWeight: '800',
          marginTop: 4,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
