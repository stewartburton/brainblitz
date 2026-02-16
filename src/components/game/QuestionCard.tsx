// ============================================================
// Frenchie Trivia — Question Card Component
// ============================================================

import React from 'react';
import { View, Text } from 'react-native';
import { ShuffledQuestion } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ICONS, DIFFICULTY_CONFIG } from '@/utils/constants';

interface QuestionCardProps {
  question: ShuffledQuestion;
  roundNumber: number;
  totalRounds: number;
}

export function QuestionCard({
  question,
  roundNumber,
  totalRounds,
}: QuestionCardProps) {
  const diffConfig = DIFFICULTY_CONFIG[question.difficulty];
  const categoryLabel = CATEGORY_LABELS[question.category] || question.category;
  const categoryIcon = CATEGORY_ICONS[question.category] || '❓';

  return (
    <View
      style={{
        backgroundColor: 'rgba(30, 20, 60, 0.85)',
        borderRadius: 20,
        padding: 24,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(108, 92, 231, 0.3)',
      }}
    >
      {/* Header row: round counter + difficulty + category */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        {/* Round counter */}
        <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>
          Question {roundNumber} of {totalRounds}
        </Text>

        {/* Difficulty badge */}
        <View
          style={{
            backgroundColor: diffConfig.color + '33',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: diffConfig.color + '66',
          }}
        >
          <Text
            style={{
              color: diffConfig.color,
              fontSize: 12,
              fontWeight: '700',
            }}
          >
            {diffConfig.label.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Category tag */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 16, marginRight: 6 }}>{categoryIcon}</Text>
        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: 13,
          }}
        >
          {categoryLabel}
        </Text>
      </View>

      {/* Question text */}
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 20,
          fontWeight: '700',
          lineHeight: 28,
        }}
      >
        {question.question}
      </Text>
    </View>
  );
}
