// ============================================================
// Frenchie Trivia — Achievements Screen
// Displays all 30 achievements with earned/locked states
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ACHIEVEMENTS } from '@/utils/achievements';
import { Achievement } from '@/types';

// Categories for filtering
const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'gameplay', label: 'Gameplay' },
  { key: 'streak', label: 'Streaks' },
  { key: 'score', label: 'Score' },
  { key: 'special', label: 'Special' },
];

export default function AchievementsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // TODO: Replace with actual earned achievements from user data
  const earnedIds = new Set<string>([]);

  const filteredAchievements = useMemo(() => {
    let list = [...ACHIEVEMENTS];
    if (selectedCategory !== 'all') {
      list = list.filter((a) => a.category === selectedCategory);
    }
    // Sort earned first, then by category
    list.sort((a, b) => {
      const aEarned = earnedIds.has(a.id) ? 0 : 1;
      const bEarned = earnedIds.has(b.id) ? 0 : 1;
      if (aEarned !== bEarned) return aEarned - bEarned;
      return 0;
    });
    return list;
  }, [selectedCategory, earnedIds]);

  const earnedCount = ACHIEVEMENTS.filter((a) => earnedIds.has(a.id)).length;

  const renderItem = ({ item }: { item: Achievement }) => {
    const isEarned = earnedIds.has(item.id);
    const isSecret = item.isSecret && !isEarned;

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: 20,
          backgroundColor: isEarned
            ? 'rgba(0, 184, 148, 0.08)'
            : 'transparent',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.05)',
        }}
      >
        {/* Icon */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: isEarned
              ? 'rgba(0, 184, 148, 0.2)'
              : 'rgba(255,255,255,0.05)',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 14,
          }}
        >
          <Text style={{ fontSize: 24, opacity: isEarned ? 1 : 0.3 }}>
            {isSecret ? '❓' : item.icon}
          </Text>
        </View>

        {/* Text */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: isEarned ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
              fontSize: 15,
              fontWeight: '700',
            }}
          >
            {isSecret ? '???' : item.name}
          </Text>
          <Text
            style={{
              color: isEarned
                ? 'rgba(255,255,255,0.5)'
                : 'rgba(255,255,255,0.3)',
              fontSize: 13,
              marginTop: 2,
            }}
          >
            {isSecret ? 'Secret achievement — keep playing to discover!' : item.description}
          </Text>
        </View>

        {/* Earned badge */}
        {isEarned && (
          <View
            style={{
              backgroundColor: '#00B894',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
              EARNED
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A1035' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <Text style={{ color: '#6C5CE7', fontSize: 16 }}>← Back</Text>
        </Pressable>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 24,
            fontWeight: '800',
            marginLeft: 12,
            flex: 1,
          }}
        >
          🏅 Achievements
        </Text>
        <Text style={{ color: '#6C5CE7', fontSize: 14, fontWeight: '700' }}>
          {earnedCount}/{ACHIEVEMENTS.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <View
          style={{
            height: 6,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${(earnedCount / ACHIEVEMENTS.length) * 100}%`,
              height: '100%',
              backgroundColor: '#6C5CE7',
              borderRadius: 3,
            }}
          />
        </View>
      </View>

      {/* Category Tabs */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          marginBottom: 8,
          gap: 6,
        }}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.key}
            onPress={() => setSelectedCategory(cat.key)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor:
                selectedCategory === cat.key
                  ? '#6C5CE7'
                  : 'rgba(30, 20, 60, 0.6)',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color:
                  selectedCategory === cat.key
                    ? '#FFFFFF'
                    : 'rgba(255,255,255,0.5)',
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Achievement List */}
      <FlatList
        data={filteredAchievements}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}
