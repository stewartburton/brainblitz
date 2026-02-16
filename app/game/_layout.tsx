// ============================================================
// Frenchie Trivia — Game Route Layout
// Disables swipe-back gesture during active gameplay
// ============================================================

import { Stack } from 'expo-router';

export default function GameLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#1A1035' },
        gestureEnabled: false,
        animation: 'fade',
      }}
    />
  );
}
