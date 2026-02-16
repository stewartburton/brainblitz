// ============================================================
// Frenchie Trivia — Themed Username Generator
// ============================================================

const ADJECTIVES = [
  'Brave', 'Cheeky', 'Clever', 'Cuddly', 'Dapper', 'Dreamy',
  'Fluffy', 'Gentle', 'Goofy', 'Happy', 'Jolly', 'Lucky',
  'Mighty', 'Noble', 'Perky', 'Playful', 'Quirky', 'Royal',
  'Sassy', 'Sleepy', 'Sneaky', 'Snuggly', 'Speedy', 'Spunky',
  'Sturdy', 'Sweet', 'Tiny', 'Wiggly', 'Wild', 'Zippy',
  'Bouncy', 'Chunky', 'Feisty', 'Frisky', 'Grumpy', 'Peppy',
  'Plucky', 'Pudgy', 'Rascal', 'Snappy', 'Stocky', 'Stubby',
  'Wobbly', 'Wrinkly', 'Zesty', 'Batty', 'Beefy', 'Cosmic',
];

const FRENCHIE_NOUNS = [
  'Frenchie', 'Bulldog', 'Pup', 'Snorer', 'Snorter', 'Zoomer',
  'Napper', 'Chomper', 'Barkley', 'Wiggler', 'Snuggler', 'Frog',
  'Potato', 'Loafer', 'Goblin', 'Gremlin', 'Piglet', 'Nugget',
  'Muffin', 'Biscuit', 'Pancake', 'Dumpling', 'Truffle', 'Waffle',
  'Tater', 'Bean', 'Peanut', 'Pretzel', 'Strudel', 'Pudding',
  'Snoot', 'BatEar', 'Wrinkle', 'Snuffles', 'Waddler', 'Squish',
];

/**
 * Generate a fun Frenchie-themed display name.
 * Format: "AdjectiveFrenchieNoun42"
 *
 * Examples: "BraveSnorter77", "SleepyPotato12", "CheekyFrenchie99"
 */
export function generateDisplayName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = FRENCHIE_NOUNS[Math.floor(Math.random() * FRENCHIE_NOUNS.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj}${noun}${num}`;
}

/**
 * Validate a user-chosen display name.
 */
export function validateDisplayName(name: string): {
  valid: boolean;
  error?: string;
} {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }
  if (name.length < 3) {
    return { valid: false, error: 'Name must be at least 3 characters' };
  }
  if (name.length > 20) {
    return { valid: false, error: 'Name must be 20 characters or less' };
  }
  if (!/^[a-zA-Z0-9_\- ]+$/.test(name)) {
    return {
      valid: false,
      error: 'Only letters, numbers, spaces, hyphens, and underscores allowed',
    };
  }
  return { valid: true };
}
