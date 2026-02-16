// ============================================================
// Frenchie Trivia — Tab Navigation Layout
// ============================================================

import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 6 }}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text
        style={{
          fontSize: 10,
          color: focused ? '#6C5CE7' : 'rgba(255,255,255,0.4)',
          fontWeight: focused ? '700' : '400',
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D0820',
          borderTopColor: 'rgba(108, 92, 231, 0.2)',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#6C5CE7',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏆" label="Rankings" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🐕" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
