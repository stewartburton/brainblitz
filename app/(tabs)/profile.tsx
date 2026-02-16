// ============================================================
// Frenchie Trivia — Profile Screen
// User stats, level progress, achievements, and settings
// ============================================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useAuthStore } from '@/hooks/useAuthStore';
import { formatScore, calculateAccuracy } from '@/utils/scoring';
import { getLevelForXp, FRENCHIE_AVATARS } from '@/utils/constants';

export default function ProfileScreen() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#1A1035', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 18 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const levelInfo = getLevelForXp(user.totalXp);
  const accuracy = calculateAccuracy(user.totalCorrect, user.totalGames * 10); // approximate
  const avatar = FRENCHIE_AVATARS.find((a) => a.id === user.avatarId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A1035' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Header */}
        <View style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 24 }}>
          {/* Avatar */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(108, 92, 231, 0.3)',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 3,
              borderColor: '#6C5CE7',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 40 }}>{avatar?.emoji || '🐕'}</Text>
          </View>

          {/* Name + Level */}
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 24,
              fontWeight: '800',
            }}
          >
            {user.displayName}
          </Text>
          <Text
            style={{
              color: '#6C5CE7',
              fontSize: 14,
              fontWeight: '600',
              marginTop: 4,
            }}
          >
            Level {levelInfo.level} • {levelInfo.title}
          </Text>

          {/* XP Progress Bar */}
          <View
            style={{
              width: 200,
              height: 6,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 3,
              marginTop: 12,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${levelInfo.progressPercent}%`,
                height: '100%',
                backgroundColor: '#6C5CE7',
                borderRadius: 3,
              }}
            />
          </View>
          <Text
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 11,
              marginTop: 6,
            }}
          >
            {formatScore(user.totalXp)} / {formatScore(levelInfo.nextLevelXp)} XP
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 13,
              fontWeight: '600',
              marginBottom: 10,
              letterSpacing: 1,
            }}
          >
            YOUR STATS
          </Text>

          <View
            style={{
              backgroundColor: 'rgba(30, 20, 60, 0.85)',
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: 'rgba(108, 92, 231, 0.3)',
            }}
          >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <StatItem label="Games Played" value={`${user.totalGames}`} />
              <StatItem label="Total Score" value={formatScore(user.totalScore)} />
              <StatItem label="Best Game" value={formatScore(user.bestGameScore)} />
              <StatItem label="Best Streak" value={`${user.bestStreak}x`} />
              <StatItem label="Accuracy" value={`${accuracy}%`} />
              <StatItem label="Total XP" value={formatScore(user.totalXp)} />
            </View>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 13,
              fontWeight: '600',
              marginBottom: 10,
              letterSpacing: 1,
            }}
          >
            ACHIEVEMENTS
          </Text>

          <View
            style={{
              backgroundColor: 'rgba(30, 20, 60, 0.85)',
              borderRadius: 20,
              padding: 20,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(108, 92, 231, 0.3)',
            }}
          >
            <Text style={{ fontSize: 32 }}>🏅</Text>
            <Text
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 14,
                marginTop: 8,
              }}
            >
              Play more games to unlock achievements!
            </Text>
          </View>
        </View>

        {/* Account Section */}
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
            ACCOUNT
          </Text>

          <View
            style={{
              backgroundColor: 'rgba(30, 20, 60, 0.85)',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(108, 92, 231, 0.3)',
              overflow: 'hidden',
            }}
          >
            {user.authProvider === 'anonymous' && (
              <Pressable
                style={{
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(255,255,255,0.05)',
                }}
              >
                <Text style={{ color: '#6C5CE7', fontSize: 15, fontWeight: '600' }}>
                  🔒 Create Account
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
                  Save your progress across devices
                </Text>
              </Pressable>
            )}

            <Pressable
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.05)',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                ✏️ Edit Display Name
              </Text>
            </Pressable>

            <Pressable
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.05)',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                🎨 Change Avatar
              </Text>
            </Pressable>

            <Pressable style={{ padding: 16 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                ⚙️ Settings
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ width: '50%', paddingVertical: 8, paddingHorizontal: 4 }}>
      <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
        {label}
      </Text>
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 18,
          fontWeight: '700',
          marginTop: 2,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
