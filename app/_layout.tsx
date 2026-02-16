// ============================================================
// Frenchie Trivia — Root Layout
// Sets up auth, loads questions, initialises audio, dark theme
// ============================================================

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useAppInit } from '@/hooks/useAppInit';
import { soundManager } from '@/utils/soundManager';

export default function RootLayout() {
  const { isLoading: authLoading, initAuth } = useAuthStore();
  const { isLoading: questionsLoading, questionsLoaded, error } = useAppInit();

  useEffect(() => {
    initAuth();
    soundManager.init();
  }, []);

  const isLoading = authLoading || questionsLoading;

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#1A1035',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🐾</Text>
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 16, fontSize: 14 }}>
          {questionsLoading ? 'Loading questions...' : 'Starting up...'}
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1A1035' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="game/play"
          options={{
            headerShown: false,
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="game/results"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="game/daily"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="achievements"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </>
  );
}
