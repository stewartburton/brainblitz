// ============================================================
// Frenchie Trivia — Leaderboard Screen
// Global rankings with period tabs
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { LeaderboardEntry, LeaderboardPeriod } from '@/types';
import { formatScore } from '@/utils/scoring';

// Placeholder data — will be replaced with API calls
const MOCK_LEADERBOARD: LeaderboardEntry[] = Array.from({ length: 25 }, (_, i) => ({
  userId: `user_${i}`,
  displayName: [
    'BraveFrenchie42', 'SleepyPotato7', 'CheekySnorter99', 'FluffyNugget15',
    'MightyBiscuit3', 'SassyWaffle88', 'GentleBean22', 'ZippyPancake56',
    'CuddlyTruffle11', 'QuirkyGoblin44', 'SpunkyPretzel33', 'WigglyMuffin67',
    'PerkyDumpling8', 'NobleFrog21', 'DapperChomper9', 'JollySquish14',
    'FeistyNapper77', 'SturdyLoafer5', 'ChunkyPiglet28', 'PluckyGremlin61',
    'PeppyWaddler39', 'BouncyStrudel16', 'FriskyPudding73', 'ZestySnuffles2',
    'StockyBatEar48',
  ][i],
  avatarId: 'fawn',
  level: 50 - i * 2,
  score: 50000 - i * 1800 + Math.floor(Math.random() * 500),
  rank: i + 1,
}));

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'alltime', label: 'All Time' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'daily', label: 'Daily' },
];

export default function LeaderboardScreen() {
  const [selectedPeriod, setSelectedPeriod] =
    useState<LeaderboardPeriod>('alltime');

  const renderItem = ({ item }: { item: LeaderboardEntry }) => {
    const isTopThree = item.rank <= 3;
    const rankEmojis = ['🥇', '🥈', '🥉'];

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: 20,
          backgroundColor: item.isCurrentUser
            ? 'rgba(108, 92, 231, 0.15)'
            : 'transparent',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.05)',
        }}
      >
        {/* Rank */}
        <View style={{ width: 44, alignItems: 'center' }}>
          {isTopThree ? (
            <Text style={{ fontSize: 24 }}>{rankEmojis[item.rank - 1]}</Text>
          ) : (
            <Text
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: 16,
                fontWeight: '700',
              }}
            >
              #{item.rank}
            </Text>
          )}
        </View>

        {/* Avatar + Name */}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              color: isTopThree ? '#FDCB6E' : '#FFFFFF',
              fontSize: 15,
              fontWeight: isTopThree ? '700' : '600',
            }}
          >
            {item.displayName}
          </Text>
          <Text
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 12,
              marginTop: 2,
            }}
          >
            Level {item.level}
          </Text>
        </View>

        {/* Score */}
        <Text
          style={{
            color: isTopThree ? '#FDA085' : '#6C5CE7',
            fontSize: 16,
            fontWeight: '800',
          }}
        >
          {formatScore(item.score)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A1035' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            color: '#FFFFFF',
          }}
        >
          🏆 Leaderboard
        </Text>
      </View>

      {/* Period Tabs */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          marginBottom: 8,
          gap: 8,
        }}
      >
        {PERIODS.map((period) => (
          <Pressable
            key={period.key}
            onPress={() => setSelectedPeriod(period.key)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor:
                selectedPeriod === period.key
                  ? '#6C5CE7'
                  : 'rgba(30, 20, 60, 0.6)',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color:
                  selectedPeriod === period.key
                    ? '#FFFFFF'
                    : 'rgba(255,255,255,0.5)',
                fontSize: 13,
                fontWeight: '700',
              }}
            >
              {period.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Leaderboard List */}
      <FlatList
        data={MOCK_LEADERBOARD}
        renderItem={renderItem}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}
