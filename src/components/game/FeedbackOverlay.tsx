// ============================================================
// Frenchie Trivia — Feedback Overlay
// Shows "Pawfect!" / "Ruff luck!" with score breakdown
// ============================================================

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { ScoreBreakdown } from '@/utils/scoring';

interface FeedbackOverlayProps {
  message: string;
  isCorrect: boolean;
  scoreBreakdown: ScoreBreakdown | null;
  explanation?: string;
  onContinue: () => void;
}

export function FeedbackOverlay({
  message,
  isCorrect,
  scoreBreakdown,
  explanation,
  onContinue,
}: FeedbackOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeAnim,
        zIndex: 100,
      }}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          backgroundColor: isCorrect
            ? 'rgba(0, 184, 148, 0.15)'
            : 'rgba(225, 112, 85, 0.15)',
          borderWidth: 2,
          borderColor: isCorrect ? '#00B894' : '#E17055',
          borderRadius: 24,
          padding: 32,
          marginHorizontal: 32,
          alignItems: 'center',
          maxWidth: 360,
        }}
      >
        {/* Feedback emoji & message */}
        <Text style={{ fontSize: 48, marginBottom: 8 }}>
          {isCorrect ? '🐾' : '😅'}
        </Text>
        <Text
          style={{
            color: isCorrect ? '#55EFC4' : '#FF7675',
            fontSize: 24,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          {message}
        </Text>

        {/* Score breakdown (only for correct answers) */}
        {scoreBreakdown && scoreBreakdown.total > 0 && (
          <View style={{ width: '100%', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Base</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>+{scoreBreakdown.base}</Text>
            </View>
            {scoreBreakdown.speed > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>⚡ Speed Bonus</Text>
                <Text style={{ color: '#FDCB6E', fontSize: 14, fontWeight: '600' }}>+{scoreBreakdown.speed}</Text>
              </View>
            )}
            {scoreBreakdown.streak > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>🔥 Streak Bonus</Text>
                <Text style={{ color: '#E17055', fontSize: 14, fontWeight: '600' }}>+{scoreBreakdown.streak}</Text>
              </View>
            )}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.2)',
                paddingTop: 6,
                marginTop: 4,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Total</Text>
              <Text style={{ color: '#55EFC4', fontSize: 16, fontWeight: '800' }}>+{scoreBreakdown.total}</Text>
            </View>
          </View>
        )}

        {/* Explanation / Fun fact */}
        {explanation && (
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              padding: 12,
              width: '100%',
              marginBottom: 16,
            }}
          >
            <Text style={{ color: '#FDCB6E', fontSize: 12, fontWeight: '700', marginBottom: 4 }}>
              💡 Did you know?
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 18 }}>
              {explanation}
            </Text>
          </View>
        )}

        {/* Continue button */}
        <Pressable
          onPress={onContinue}
          style={{
            backgroundColor: isCorrect ? '#00B894' : '#6C5CE7',
            paddingHorizontal: 32,
            paddingVertical: 14,
            borderRadius: 14,
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
            Continue →
          </Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}
