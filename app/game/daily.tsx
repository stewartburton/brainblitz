// ============================================================
// Frenchie Trivia — Daily Challenge Screen
// Same 10 questions for all players, separate leaderboard
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/hooks/useGameStore';
import { api } from '@/services/api';
import { Question } from '@/types';

export default function DailyChallengeScreen() {
  const router = useRouter();
  const { setQuestionBank, startGame } = useGameStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyQuestions, setDailyQuestions] = useState<Question[]>([]);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);

  useEffect(() => {
    loadDailyChallenge();
  }, []);

  const loadDailyChallenge = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getDailyChallenge();
      if (response.success && response.data) {
        setDailyQuestions(response.data.questions);
      } else {
        setError('Daily challenge not available');
      }
    } catch {
      setError('Failed to load daily challenge');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    if (dailyQuestions.length === 0) return;

    // Override the question bank with daily questions only
    setQuestionBank(dailyQuestions);
    startGame({
      mode: 'daily',
      category: 'all',
      difficulty: 'mixed',
      totalRounds: dailyQuestions.length,
    });
    router.push('/game/play');
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#1A1035',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>
          Loading today's challenge...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A1035' }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 32,
        }}
      >
        {/* Icon */}
        <Text style={{ fontSize: 64, marginBottom: 16 }}>📅</Text>

        {/* Title */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            color: '#FFFFFF',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          Daily Challenge
        </Text>

        {/* Date */}
        <Text
          style={{
            color: '#6C5CE7',
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 24,
          }}
        >
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>

        {/* Description */}
        <Text
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 15,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 32,
          }}
        >
          Everyone gets the same 10 questions today. One attempt only — make it
          count! Compare your score on the daily leaderboard.
        </Text>

        {error ? (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#E17055', fontSize: 15, marginBottom: 16 }}>
              {error}
            </Text>
            <Pressable
              onPress={loadDailyChallenge}
              style={{
                backgroundColor: '#6C5CE7',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                Try Again
              </Text>
            </Pressable>
          </View>
        ) : alreadyPlayed ? (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#00B894', fontSize: 18, fontWeight: '700' }}>
              ✅ Already completed today!
            </Text>
            <Text
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 14,
                marginTop: 8,
              }}
            >
              Come back tomorrow for a new challenge
            </Text>
          </View>
        ) : (
          <>
            {/* Stats preview */}
            <View
              style={{
                backgroundColor: 'rgba(30, 20, 60, 0.85)',
                borderRadius: 16,
                padding: 20,
                width: '100%',
                marginBottom: 24,
                borderWidth: 1,
                borderColor: 'rgba(108, 92, 231, 0.3)',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>
                    {dailyQuestions.length}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                    Questions
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>
                    Mixed
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                    Difficulty
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>
                    1x
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                    Attempt
                  </Text>
                </View>
              </View>
            </View>

            {/* Start button */}
            <Pressable
              onPress={handleStart}
              style={{
                backgroundColor: '#FDA085',
                borderRadius: 16,
                paddingHorizontal: 48,
                paddingVertical: 18,
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#1A1035',
                  fontSize: 18,
                  fontWeight: '800',
                }}
              >
                🐾 Start Challenge
              </Text>
            </Pressable>
          </>
        )}

        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          style={{ marginTop: 24, padding: 12 }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>
            Back to Home
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
