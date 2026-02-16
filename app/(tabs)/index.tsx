// ============================================================
// Frenchie Trivia — Home Screen
// Main hub: quick play, category select, daily challenge
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useGameStore } from '@/hooks/useGameStore';
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  DIFFICULTY_CONFIG,
  getLevelForXp,
} from '@/utils/constants';
import { Category, Difficulty } from '@/types';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { startGame, questionBank } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'mixed'>('mixed');

  const levelInfo = user ? getLevelForXp(user.totalXp) : null;

  const handleQuickPlay = () => {
    startGame({
      mode: 'casual',
      category: selectedCategory,
      difficulty: selectedDifficulty,
      totalRounds: 10,
    });
    router.push('/game/play');
  };

  const handleRankedPlay = () => {
    startGame({
      mode: 'ranked',
      category: selectedCategory,
      difficulty: selectedDifficulty,
      totalRounds: 15,
    });
    router.push('/game/play');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A1035' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
            Welcome back,
          </Text>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: '#FFFFFF',
              marginTop: 2,
            }}
          >
            {user?.displayName || 'Frenchie Fan'}
          </Text>
          {levelInfo && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <Text style={{ color: '#6C5CE7', fontSize: 13, fontWeight: '600' }}>
                Level {levelInfo.level}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.3)', marginHorizontal: 8 }}>•</Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                {levelInfo.title}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Play Button */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Pressable
            onPress={handleQuickPlay}
            style={{
              backgroundColor: '#6C5CE7',
              borderRadius: 20,
              padding: 24,
              alignItems: 'center',
              shadowColor: '#6C5CE7',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🐾</Text>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 22,
                fontWeight: '800',
              }}
            >
              QUICK PLAY
            </Text>
            <Text
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 14,
                marginTop: 4,
              }}
            >
              10 random questions • Casual mode
            </Text>
          </Pressable>
        </View>

        {/* Ranked Play Button */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Pressable
            onPress={handleRankedPlay}
            style={{
              backgroundColor: 'rgba(30, 20, 60, 0.85)',
              borderRadius: 20,
              padding: 20,
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#FDA085',
            }}
          >
            <Text style={{ fontSize: 28, marginBottom: 6 }}>🏆</Text>
            <Text
              style={{
                color: '#FDA085',
                fontSize: 18,
                fontWeight: '800',
              }}
            >
              RANKED GAME
            </Text>
            <Text
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 13,
                marginTop: 4,
              }}
            >
              15 questions • Counts toward leaderboard
            </Text>
          </Pressable>
        </View>

        {/* Difficulty Selection */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 13,
              fontWeight: '600',
              marginBottom: 10,
              letterSpacing: 1,
            }}
          >
            DIFFICULTY
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['mixed', 'easy', 'medium', 'hard'] as const).map((diff) => {
              const isActive = selectedDifficulty === diff;
              const color =
                diff === 'mixed'
                  ? '#A29BFE'
                  : DIFFICULTY_CONFIG[diff].color;
              return (
                <Pressable
                  key={diff}
                  onPress={() => setSelectedDifficulty(diff)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: isActive
                      ? color + '33'
                      : 'rgba(30, 20, 60, 0.6)',
                    borderWidth: 1.5,
                    borderColor: isActive ? color : 'rgba(108, 92, 231, 0.2)',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: isActive ? color : 'rgba(255,255,255,0.5)',
                      fontSize: 13,
                      fontWeight: '700',
                    }}
                  >
                    {diff === 'mixed' ? 'Mixed' : DIFFICULTY_CONFIG[diff].label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Category Selection */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 13,
              fontWeight: '600',
              marginBottom: 10,
              letterSpacing: 1,
            }}
          >
            CATEGORY
          </Text>

          {/* All categories option */}
          <Pressable
            onPress={() => setSelectedCategory('all')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 14,
              borderRadius: 14,
              backgroundColor:
                selectedCategory === 'all'
                  ? 'rgba(108, 92, 231, 0.2)'
                  : 'rgba(30, 20, 60, 0.5)',
              borderWidth: 1.5,
              borderColor:
                selectedCategory === 'all'
                  ? '#6C5CE7'
                  : 'rgba(108, 92, 231, 0.15)',
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 12 }}>🎲</Text>
            <View>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                All Categories
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                Questions from every category
              </Text>
            </View>
          </Pressable>

          {/* Individual categories */}
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                borderRadius: 14,
                backgroundColor:
                  selectedCategory === cat
                    ? 'rgba(108, 92, 231, 0.2)'
                    : 'rgba(30, 20, 60, 0.5)',
                borderWidth: 1.5,
                borderColor:
                  selectedCategory === cat
                    ? '#6C5CE7'
                    : 'rgba(108, 92, 231, 0.15)',
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 20, marginRight: 12 }}>
                {CATEGORY_ICONS[cat]}
              </Text>
              <Text
                style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}
              >
                {CATEGORY_LABELS[cat]}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
