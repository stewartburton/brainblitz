// ============================================================
// Frenchie Trivia — Haptic Feedback Utility
// Wraps expo-haptics with game-specific presets
// ============================================================

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isIOS = Platform.OS === 'ios';

/**
 * Light tap — button press, answer selection
 */
export function hapticTap() {
  if (isIOS) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

/**
 * Medium tap — correct answer, navigation
 */
export function hapticMedium() {
  if (isIOS) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

/**
 * Heavy thud — wrong answer, game over
 */
export function hapticHeavy() {
  if (isIOS) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
}

/**
 * Success notification — correct answer, achievement earned, streak
 */
export function hapticSuccess() {
  if (isIOS) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

/**
 * Warning notification — timer running low
 */
export function hapticWarning() {
  if (isIOS) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
}

/**
 * Error notification — wrong answer, timeout
 */
export function hapticError() {
  if (isIOS) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
}

/**
 * Selection tick — scrolling through categories, toggling options
 */
export function hapticSelection() {
  if (isIOS) {
    Haptics.selectionAsync();
  }
}

/**
 * Streak celebration — rapid success pulses for big streaks
 */
export async function hapticStreakCelebration(streakCount: number) {
  if (!isIOS) return;

  const pulses = Math.min(streakCount, 5);
  for (let i = 0; i < pulses; i++) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 80));
  }
}
