// ============================================================
// Frenchie Trivia — Score HUD Component
// Displays score, streak, and accuracy during gameplay
// ============================================================

import React from 'react';
import { View, Text } from 'react-native';
import { formatScore } from '@/utils/scoring';

interface ScoreHUDProps {
  score: number;
  streak: number;
  correctCount: number;
  currentRound: number;
}

export function ScoreHUD({
  score,
  streak,
  correctCount,
  currentRound,
}: ScoreHUDProps) {
  const getStreakDisplay = () => {
    if (streak >= 5) return { text: `🔥 ${streak}x`, color: '#E17055' };
    if (streak >= 3) return { text: `⚡ ${streak}x`, color: '#FDCB6E' };
    if (streak > 0) return { text: `${streak}x`, color: '#00CEC9' };
    return null;
  };

  const streakInfo = getStreakDisplay();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
      }}
    >
      {/* Score */}
      <View style={{ alignItems: 'flex-start' }}>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
          SCORE
        </Text>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 24,
            fontWeight: '800',
          }}
        >
          {formatScore(score)}
        </Text>
      </View>

      {/* Streak */}
      <View style={{ alignItems: 'center' }}>
        {streakInfo ? (
          <>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
              STREAK
            </Text>
            <Text
              style={{
                color: streakInfo.color,
                fontSize: 22,
                fontWeight: '800',
              }}
            >
              {streakInfo.text}
            </Text>
          </>
        ) : (
          <>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
              STREAK
            </Text>
            <Text
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: 22,
                fontWeight: '800',
              }}
            >
              —
            </Text>
          </>
        )}
      </View>

      {/* Accuracy */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
          CORRECT
        </Text>
        <Text
          style={{
            color: '#00B894',
            fontSize: 24,
            fontWeight: '800',
          }}
        >
          {correctCount}/{currentRound > 0 ? currentRound : 0}
        </Text>
      </View>
    </View>
  );
}
