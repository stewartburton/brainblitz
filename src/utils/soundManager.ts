// ============================================================
// Frenchie Trivia — Sound Manager
// Preloaded sound effects using expo-av
// ============================================================

import { Audio } from 'expo-av';

// Sound effect keys
export type SoundEffect =
  | 'correct'
  | 'wrong'
  | 'timeout'
  | 'streak'
  | 'mega_streak'
  | 'countdown_tick'
  | 'countdown_go'
  | 'game_over'
  | 'achievement'
  | 'button_tap'
  | 'timer_warning';

// We'll use synthesised sounds via Audio API for now
// These can be replaced with actual audio files in assets/audio/sfx/
// once we have them. This approach means zero external dependencies.

class SoundManager {
  private sounds: Map<SoundEffect, Audio.Sound> = new Map();
  private isEnabled: boolean = true;
  private isLoaded: boolean = false;
  private volume: number = 0.7;

  /**
   * Configure audio session for game use.
   * Call once at app startup.
   */
  async init() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false, // Respect mute switch
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.isLoaded = true;
    } catch (err) {
      console.warn('SoundManager init failed:', err);
    }
  }

  /**
   * Preload all sound effects.
   * Call after init, e.g. on home screen mount.
   */
  async preloadAll() {
    if (!this.isLoaded) await this.init();

    // Map of sound effects to their audio file paths
    // These will be actual .mp3/.aac files in the final build
    const soundFiles: Partial<Record<SoundEffect, any>> = {
      // Placeholder: uncomment when audio files are added
      // correct: require('../../assets/audio/sfx/correct.mp3'),
      // wrong: require('../../assets/audio/sfx/wrong.mp3'),
      // streak: require('../../assets/audio/sfx/streak.mp3'),
      // countdown_tick: require('../../assets/audio/sfx/tick.mp3'),
      // game_over: require('../../assets/audio/sfx/gameover.mp3'),
      // achievement: require('../../assets/audio/sfx/achievement.mp3'),
    };

    for (const [key, file] of Object.entries(soundFiles)) {
      try {
        const { sound } = await Audio.Sound.createAsync(file, {
          volume: this.volume,
          shouldPlay: false,
        });
        this.sounds.set(key as SoundEffect, sound);
      } catch (err) {
        console.warn(`Failed to load sound: ${key}`, err);
      }
    }
  }

  /**
   * Play a sound effect.
   */
  async play(effect: SoundEffect) {
    if (!this.isEnabled) return;

    const sound = this.sounds.get(effect);
    if (!sound) return;

    try {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (err) {
      console.warn(`Failed to play sound: ${effect}`, err);
    }
  }

  /**
   * Enable/disable sound effects.
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Set volume (0.0 to 1.0).
   */
  async setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    for (const sound of this.sounds.values()) {
      try {
        await sound.setVolumeAsync(this.volume);
      } catch {}
    }
  }

  /**
   * Unload all sounds to free memory.
   */
  async unloadAll() {
    for (const sound of this.sounds.values()) {
      try {
        await sound.unloadAsync();
      } catch {}
    }
    this.sounds.clear();
  }

  get enabled() {
    return this.isEnabled;
  }
}

// Singleton
export const soundManager = new SoundManager();
