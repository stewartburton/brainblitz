// ============================================================
// Frenchie Trivia — Countdown Overlay
// Animated 3-2-1-🐾 countdown before game starts
// ============================================================

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { hapticMedium, hapticSuccess } from '@/utils/haptics';

const { width, height } = Dimensions.get('window');

interface CountdownOverlayProps {
  onComplete: () => void;
}

const STEPS = ['3', '2', '1', '🐾'];
const COLORS = ['#6C5CE7', '#00CEC9', '#FDA085', '#00B894'];

export function CountdownOverlay({ onComplete }: CountdownOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animateStep();
  }, [currentStep]);

  const animateStep = () => {
    // Reset
    scaleAnim.setValue(0.3);
    opacityAnim.setValue(0);

    // Haptic on each step
    if (currentStep < 3) {
      hapticMedium();
    } else {
      hapticSuccess();
    }

    // Animate in
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Hold, then animate out
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (currentStep < STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
          } else {
            onComplete();
          }
        });
      }, 500);
    });
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        backgroundColor: 'rgba(26, 16, 53, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 200,
      }}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
      >
        <Text
          style={{
            fontSize: currentStep === 3 ? 100 : 120,
            fontWeight: '900',
            color: COLORS[currentStep],
            textAlign: 'center',
          }}
        >
          {STEPS[currentStep]}
        </Text>
      </Animated.View>

      {/* Subtitle */}
      {currentStep === 3 && (
        <Animated.Text
          style={{
            opacity: opacityAnim,
            color: '#FFFFFF',
            fontSize: 24,
            fontWeight: '700',
            marginTop: 16,
          }}
        >
          LET'S GO!
        </Animated.Text>
      )}
    </View>
  );
}
