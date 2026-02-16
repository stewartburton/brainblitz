// ============================================================
// Frenchie Trivia — Share Card Component
// Generates a branded result card for social media sharing
// ============================================================

import React from 'react';
import { View, Text, Pressable, Share, Alert } from 'react-native';
import { formatScore, calculateAccuracy } from '@/utils/scoring';

interface ShareCardProps {
  score: number;
  correctCount: number;
  totalRounds: number;
  bestStreak: number;
  category: string;
}

/**
 * Generates a text-based share message.
 * In future, this could render to an image using react-native-view-shot.
 */
export function ShareCard({
  score,
  correctCount,
  totalRounds,
  bestStreak,
  category,
}: ShareCardProps) {
  const accuracy = calculateAccuracy(correctCount, totalRounds);

  const getEmoji = () => {
    if (accuracy >= 90) return '🏆';
    if (accuracy >= 70) return '🌟';
    if (accuracy >= 50) return '🐾';
    return '💪';
  };

  const generateShareText = () => {
    const lines = [
      `${getEmoji()} Frenchie Trivia Results!`,
      '',
      `🐕 Score: ${formatScore(score)}`,
      `✅ ${correctCount}/${totalRounds} correct (${accuracy}%)`,
      `🔥 Best streak: ${bestStreak}x`,
      '',
      `Think you can beat me? 🐾`,
      '',
      `Download Frenchie Trivia:`,
      `https://frenchietrivia.com`,
    ];
    return lines.join('\n');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: generateShareText(),
        title: 'My Frenchie Trivia Score',
      });
    } catch (err) {
      Alert.alert('Share failed', 'Unable to share your results');
    }
  };

  return (
    <View>
      {/* Preview Card */}
      <View
        style={{
          backgroundColor: 'rgba(108, 92, 231, 0.15)',
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: 'rgba(108, 92, 231, 0.3)',
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 28, marginRight: 8 }}>{getEmoji()}</Text>
          <View>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
              Frenchie Trivia
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
              {category === 'all' ? 'All Categories' : category}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#6C5CE7', fontSize: 22, fontWeight: '800' }}>
              {formatScore(score)}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Score</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#00B894', fontSize: 22, fontWeight: '800' }}>
              {accuracy}%
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Accuracy</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#FDCB6E', fontSize: 22, fontWeight: '800' }}>
              {bestStreak}x
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Streak</Text>
          </View>
        </View>
      </View>

      {/* Share Button */}
      <Pressable
        onPress={handleShare}
        style={{
          backgroundColor: '#6C5CE7',
          borderRadius: 14,
          padding: 16,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 18, marginRight: 8 }}>📤</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
          Share Results
        </Text>
      </Pressable>
    </View>
  );
}
