// ============================================================
// Frenchie Trivia — Timer Bar Component
// Animated countdown bar with danger pulse when time is low
// ============================================================

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

interface TimerBarProps {
  timeLeft: number;
  totalTime: number;
  isPaused: boolean;
}

export function TimerBar({ timeLeft, totalTime, isPaused }: TimerBarProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ratio = totalTime > 0 ? timeLeft / totalTime : 0;
  const percentage = Math.max(0, Math.min(100, ratio * 100));
  const isDanger = ratio < 0.3;

  // Danger pulse animation
  useEffect(() => {
    if (isDanger && !isPaused) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isDanger, isPaused]);

  const getBarColor = () => {
    if (ratio > 0.6) return '#00B894';
    if (ratio > 0.3) return '#FDCB6E';
    return '#E17055';
  };

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
      {/* Timer text */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}>
          ⏱️ Time
        </Text>
        <Animated.Text
          style={{
            color: isDanger ? '#E17055' : '#FFFFFF',
            fontSize: 14,
            fontWeight: '700',
            opacity: isDanger ? pulseAnim : 1,
          }}
        >
          {timeLeft.toFixed(1)}s
        </Animated.Text>
      </View>

      {/* Bar background */}
      <View
        style={{
          height: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {/* Bar fill */}
        <Animated.View
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: getBarColor(),
            borderRadius: 4,
            opacity: isDanger ? pulseAnim : 1,
          }}
        />
      </View>
    </View>
  );
}
