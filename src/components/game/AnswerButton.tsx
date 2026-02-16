// ============================================================
// Frenchie Trivia — Answer Button Component
// Animated answer button with correct/wrong/selected states
// ============================================================

import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface AnswerButtonProps {
  text: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  isRevealed: boolean;
  disabled: boolean;
  onPress: (index: number) => void;
}

const BUTTON_COLORS = ['#6C5CE7', '#00CEC9', '#FDA085', '#FDCB6E'];

export function AnswerButton({
  text,
  index,
  isSelected,
  isCorrect,
  isRevealed,
  disabled,
  onPress,
}: AnswerButtonProps) {
  const getBackgroundColor = () => {
    if (isRevealed && isCorrect) return '#00B894';
    if (isRevealed && isSelected && !isCorrect) return '#E17055';
    if (isRevealed && !isSelected) return 'rgba(30, 20, 60, 0.4)';
    if (isSelected) return BUTTON_COLORS[index];
    return 'rgba(30, 20, 60, 0.75)';
  };

  const getBorderColor = () => {
    if (isRevealed && isCorrect) return '#55EFC4';
    if (isRevealed && isSelected && !isCorrect) return '#FF7675';
    if (isSelected) return BUTTON_COLORS[index];
    return 'rgba(108, 92, 231, 0.3)';
  };

  const getOpacity = () => {
    if (isRevealed && !isCorrect && !isSelected) return 0.4;
    return 1;
  };

  const labels = ['A', 'B', 'C', 'D'];

  return (
    <Pressable
      onPress={() => !disabled && onPress(index)}
      disabled={disabled}
      style={{
        flex: 1,
        minHeight: 64,
        backgroundColor: getBackgroundColor(),
        borderWidth: 2,
        borderColor: getBorderColor(),
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginVertical: 4,
        marginHorizontal: 4,
        opacity: getOpacity(),
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {/* Letter label */}
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '700',
          }}
        >
          {labels[index]}
        </Text>
      </View>

      {/* Answer text */}
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: '600',
          flex: 1,
        }}
        numberOfLines={3}
      >
        {text}
      </Text>

      {/* Result icon */}
      {isRevealed && isCorrect && (
        <Text style={{ fontSize: 20, marginLeft: 8 }}>✅</Text>
      )}
      {isRevealed && isSelected && !isCorrect && (
        <Text style={{ fontSize: 20, marginLeft: 8 }}>❌</Text>
      )}
    </Pressable>
  );
}
