// ============================================================
// Frenchie Trivia — Settings Screen
// Sound, haptics, account, cache management
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/hooks/useAuthStore';
import { soundManager } from '@/utils/soundManager';
import { clearQuestionCache, getCachedQuestionCount } from '@/services/questionCache';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [cachedQuestions, setCachedQuestions] = useState(0);

  useEffect(() => {
    getCachedQuestionCount().then(setCachedQuestions);
  }, []);

  const toggleSound = (value: boolean) => {
    setSoundEnabled(value);
    soundManager.setEnabled(value);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Question Cache',
      'Questions will be re-downloaded next time you play. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearQuestionCache();
            setCachedQuestions(0);
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    if (user?.authProvider === 'anonymous') {
      Alert.alert(
        'Warning',
        'You have a guest account. Logging out will lose all your progress permanently. Create an account first to save your data.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout Anyway',
            style: 'destructive',
            onPress: () => {
              logout();
              router.replace('/');
            },
          },
        ]
      );
    } else {
      logout();
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A1035' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 24,
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
            }}
          >
            Settings
          </Text>
        </View>

        {/* Sound & Haptics */}
        <SectionHeader title="GAMEPLAY" />
        <SettingsCard>
          <SettingsRow
            label="Sound Effects"
            icon="🔊"
            right={
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#6C5CE7' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <Divider />
          <SettingsRow
            label="Haptic Feedback"
            icon="📳"
            right={
              <Switch
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#6C5CE7' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </SettingsCard>

        {/* Data */}
        <SectionHeader title="DATA" />
        <SettingsCard>
          <SettingsRow
            label="Cached Questions"
            icon="📦"
            right={
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                {cachedQuestions} questions
              </Text>
            }
          />
          <Divider />
          <Pressable onPress={handleClearCache}>
            <SettingsRow label="Clear Question Cache" icon="🗑️" />
          </Pressable>
        </SettingsCard>

        {/* Account */}
        <SectionHeader title="ACCOUNT" />
        <SettingsCard>
          <SettingsRow
            label="Account Type"
            icon="👤"
            right={
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                {user?.authProvider === 'anonymous' ? 'Guest' : 'Registered'}
              </Text>
            }
          />
          {user?.email && (
            <>
              <Divider />
              <SettingsRow
                label="Email"
                icon="✉️"
                right={
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                    {user.email}
                  </Text>
                }
              />
            </>
          )}
          <Divider />
          <Pressable onPress={handleLogout}>
            <SettingsRow
              label="Log Out"
              icon="🚪"
              textColor="#E17055"
            />
          </Pressable>
        </SettingsCard>

        {/* About */}
        <SectionHeader title="ABOUT" />
        <SettingsCard>
          <SettingsRow
            label="Version"
            icon="📱"
            right={
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                1.0.0
              </Text>
            }
          />
          <Divider />
          <SettingsRow label="Privacy Policy" icon="🔒" />
          <Divider />
          <SettingsRow label="Terms of Service" icon="📄" />
          <Divider />
          <SettingsRow label="Rate the App" icon="⭐" />
        </SettingsCard>

        {/* Made with love */}
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            Made with 🐾 for Frenchie lovers everywhere
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Helper Components ---

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      style={{
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 1,
        paddingHorizontal: 20,
        marginTop: 24,
        marginBottom: 8,
      }}
    >
      {title}
    </Text>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        marginHorizontal: 20,
        backgroundColor: 'rgba(30, 20, 60, 0.85)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(108, 92, 231, 0.2)',
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}

function SettingsRow({
  label,
  icon,
  right,
  textColor,
}: {
  label: string;
  icon: string;
  right?: React.ReactNode;
  textColor?: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
      }}
    >
      <Text style={{ fontSize: 18, marginRight: 12 }}>{icon}</Text>
      <Text
        style={{
          color: textColor || '#FFFFFF',
          fontSize: 15,
          fontWeight: '600',
          flex: 1,
        }}
      >
        {label}
      </Text>
      {right}
    </View>
  );
}

function Divider() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginLeft: 48,
      }}
    />
  );
}
