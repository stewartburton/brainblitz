# 🐕 Frenchie Trivia — Production Build Plan

> **Forked from:** BRAINBLITZ (Lekker TV Trivia)
> **Branch:** `feature/frenchie-trivia-app`
> **Target platforms:** iOS (App Store), Android (Google Play), Web (PWA fallback)
> **Developer environment:** Windows 11, VSCode, Claude Code, iPhone 15 Pro Max
> **Backend:** Cloudflare Workers + D1 + KV + R2
> **Last updated:** 2026-02-16

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [What We Keep vs What Changes from BRAINBLITZ](#2-what-we-keep-vs-what-changes-from-brainblitz)
3. [Tech Stack Decision](#3-tech-stack-decision)
4. [Project Structure](#4-project-structure)
5. [Development Phases](#5-development-phases)
6. [Phase 1 — Foundation & Web MVP](#6-phase-1--foundation--web-mvp)
7. [Phase 2 — Core Game Engine](#7-phase-2--core-game-engine)
8. [Phase 3 — User System & Leaderboard](#8-phase-3--user-system--leaderboard)
9. [Phase 4 — Audio, Polish & Monetisation](#9-phase-4--audio-polish--monetisation)
10. [Phase 5 — Native Mobile Build & App Store Submission](#10-phase-5--native-mobile-build--app-store-submission)
11. [Phase 6 — Post-Launch & Growth](#11-phase-6--post-launch--growth)
12. [Question Bank Architecture](#12-question-bank-architecture)
13. [Question Categories — All Frenchie-Themed](#13-question-categories--all-frenchie-themed)
14. [Database Schema](#14-database-schema)
15. [API Design](#15-api-design)
16. [Authentication Flow](#16-authentication-flow)
17. [Global Leaderboard System](#17-global-leaderboard-system)
18. [Monetisation Strategy](#18-monetisation-strategy)
19. [Audio & Music Strategy](#19-audio--music-strategy)
20. [Cloudflare Infrastructure Setup](#20-cloudflare-infrastructure-setup)
21. [iOS Development Without a Mac](#21-ios-development-without-a-mac)
22. [App Store Requirements Checklist](#22-app-store-requirements-checklist)
23. [Testing Strategy](#23-testing-strategy)
24. [Marketing & Launch Plan](#24-marketing--launch-plan)
25. [Cost Projections (ZAR)](#25-cost-projections-zar)
26. [Risk Register](#26-risk-register)
27. [Success Metrics & KPIs](#27-success-metrics--kpis)
28. [File-by-File Implementation Checklist](#28-file-by-file-implementation-checklist)

---

## 1. Project Overview

**Frenchie Trivia** is a mobile trivia game built exclusively for French Bulldog enthusiasts. Players test their knowledge across thousands of questions spanning breed history, health, genetics, famous Frenchies, pop culture, and more. The app features a global ranked leaderboard, achievements, multiple game modes, and a social sharing mechanic designed to go viral within the massive Frenchie community on Instagram and TikTok.

### Core value proposition

- The **only** Frenchie-specific trivia app on any app store (verified — zero competitors exist)
- **2,000+ questions** at launch across 15+ categories, ranging from easy to expert
- **Global leaderboard** with seasonal rankings and a "Champion Frenchie Expert" title
- **Free to play** with optional premium content — maximises downloads and ad revenue
- Designed to be **shareable** — every game generates a result card optimised for Instagram Stories and TikTok

### Target audience

- **Primary:** French Bulldog owners (estimated 5–10 million worldwide)
- **Secondary:** Prospective Frenchie owners researching the breed
- **Tertiary:** Dog lovers who follow Frenchie content on social media (15–30 million reachable)
- **Geography:** USA (largest market), UK, Australia, Canada, Europe, South Africa

---

## 2. What We Keep vs What Changes from BRAINBLITZ

### Keep (port to React Native)

| Feature | Notes |
|---------|-------|
| Core trivia game loop | Question → 4 answers → timer → score → next |
| Speed scoring system | Faster answers = more points |
| Streak multiplier | 3+ correct = bonus, 5+ = celebration |
| Difficulty scaling | Easy/Medium/Hard with point multipliers (1x/1.5x/2x) |
| Answer cascade animation | Wrong answers grey out one-by-one |
| Confetti & particle effects | Winner celebration |
| Achievement system | Expand from 15 to 30+ achievements |
| Sound effects via Web Audio concepts | Re-implement with expo-av |
| Timer with danger pulse | CSS → React Native Animated/Reanimated |
| Score pop animation | HUD score flash on points added |

### Remove entirely

| Feature | Reason |
|---------|--------|
| Two-player local mode (Burden vs Stu) | Replace with single-player + global leaderboard |
| LG webOS TV compatibility | Not needed for mobile |
| Arrow key / remote navigation | Touch-native UI instead |
| Hardcoded player names | Dynamic usernames |
| Admin panel with PIN | Replace with proper admin dashboard (future) |
| South African Afrikaans expressions | Replace with Frenchie-themed expressions |
| All non-Frenchie question categories | 100% Frenchie content |
| ElevenLabs runtime TTS proxy | Pre-generated audio bundled in app |
| Single HTML file architecture | Proper React Native component tree |

### Transform

| BRAINBLITZ | Frenchie Trivia |
|------------|-----------------|
| Local 2-player | Single-player ranked + casual modes |
| "Ja Boet!", "Lekker!" feedback | "Good boy! 🐕", "Pawfect! 🐾", "Ruff luck! 🦴" |
| Cloudflare KV for scores | D1 database + Upstash Redis for leaderboard |
| localStorage settings | Async Storage + server-synced preferences |
| Static question array in HTML | D1 database + local cache with versioning |
| Neon cyberpunk theme | Warm, playful Frenchie-themed design |
| "BRAINBLITZ" title | "FRENCHIE TRIVIA" with paw print logo |

---

## 3. Tech Stack Decision

### Frontend — React Native + Expo (SDK 52+)

| Choice | Reasoning |
|--------|-----------|
| **React Native** | Cross-platform iOS + Android from single codebase |
| **Expo** | Managed workflow, EAS Build (no Mac needed), OTA updates |
| **TypeScript** | Type safety, better IDE support with Claude Code |
| **Expo Router** | File-based routing, deep linking support |
| **React Native Reanimated 3** | 60fps animations on the UI thread |
| **NativeWind (Tailwind)** | Familiar styling, responsive, fast iteration |
| **expo-av** | Audio playback for SFX and TTS |
| **expo-haptics** | Tactile feedback on correct/wrong answers |
| **expo-secure-store** | Secure token storage for auth |
| **@tanstack/react-query** | Server state management, caching, offline support |
| **zustand** | Lightweight client state (game state, settings) |

### Backend — Cloudflare Edge Stack

| Service | Use case |
|---------|----------|
| **Cloudflare Workers** | API layer (all endpoints) |
| **Cloudflare D1** | Primary database (users, questions, game history, achievements) |
| **Cloudflare KV** | Session cache, feature flags, config |
| **Cloudflare R2** | Audio file storage (pre-generated TTS clips) |
| **Upstash Redis** | Global leaderboard (sorted sets), rate limiting |
| **Hono.js** | Lightweight Workers-compatible API framework |

### Auth & Services

| Service | Use case | Cost |
|---------|----------|------|
| **Firebase Auth** | Email/password + Apple/Google sign-in | Free to 50K MAU |
| **RevenueCat** | In-app purchase management (iOS + Android) | Free to $2.5K MRR |
| **Google AdMob** | Interstitial + rewarded video ads | Revenue source |
| **Sentry** | Error tracking & crash reporting | Free tier (5K events) |
| **PostHog** | Product analytics | Free tier (1M events/month) |

### Development Tools

| Tool | Use case |
|------|----------|
| **VSCode** | Primary IDE |
| **Claude Code** | AI-assisted development |
| **Expo Go** | Live preview on iPhone 15 Pro Max |
| **EAS Build** | Cloud iOS/Android builds |
| **EAS Submit** | App store submission |
| **Wrangler CLI** | Cloudflare Workers local dev + deployment |
| **GitHub** | Source control, CI/CD |

---

## 4. Project Structure

```
frenchie-trivia/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Auth screens (login, register, forgot-password)
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/                   # Main tabbed navigation
│   │   ├── home.tsx              # Home/play screen
│   │   ├── leaderboard.tsx       # Global rankings
│   │   ├── achievements.tsx      # Achievement gallery
│   │   ├── profile.tsx           # User profile + stats
│   │   └── _layout.tsx           # Tab bar layout
│   ├── game/                     # Game flow screens
│   │   ├── setup.tsx             # Category/mode selection
│   │   ├── play.tsx              # Main game screen
│   │   ├── results.tsx           # Post-game results
│   │   └── _layout.tsx
│   ├── settings.tsx              # App settings
│   ├── store.tsx                 # In-app purchases
│   └── _layout.tsx               # Root layout
│
├── components/                   # Reusable UI components
│   ├── game/
│   │   ├── AnswerButton.tsx      # Single answer option
│   │   ├── AnswerGrid.tsx        # 2x2 answer layout
│   │   ├── TimerBar.tsx          # Animated countdown bar
│   │   ├── QuestionCard.tsx      # Question display
│   │   ├── ScoreHUD.tsx          # Score, streak, round display
│   │   ├── DifficultyBadge.tsx   # Easy/Medium/Hard indicator
│   │   ├── FeedbackOverlay.tsx   # "Pawfect!" / "Ruff luck!" overlay
│   │   ├── StreakCelebration.tsx  # 5+ streak fire animation
│   │   ├── ConfettiExplosion.tsx  # Winner confetti
│   │   └── CountdownOverlay.tsx  # 3-2-1 pre-game countdown
│   ├── ui/
│   │   ├── Button.tsx            # Themed button variants
│   │   ├── Card.tsx              # Themed card container
│   │   ├── Badge.tsx             # Category/difficulty badge
│   │   ├── Avatar.tsx            # User avatar with Frenchie icons
│   │   ├── ProgressBar.tsx       # XP / level progress
│   │   └── ShareCard.tsx         # Social sharing result image
│   ├── leaderboard/
│   │   ├── RankingRow.tsx        # Single leaderboard entry
│   │   ├── TopThreePodium.tsx    # Gold/Silver/Bronze display
│   │   └── SeasonBanner.tsx      # Current season info
│   └── achievements/
│       ├── AchievementCard.tsx   # Single achievement
│       └── AchievementToast.tsx  # Unlock notification
│
├── lib/                          # Business logic & utilities
│   ├── api/
│   │   ├── client.ts             # Fetch wrapper with auth headers
│   │   ├── questions.ts          # Question fetching + caching
│   │   ├── leaderboard.ts        # Leaderboard API calls
│   │   ├── auth.ts               # Auth API calls
│   │   ├── scores.ts             # Score submission
│   │   └── achievements.ts       # Achievement sync
│   ├── game/
│   │   ├── engine.ts             # Core game state machine
│   │   ├── scoring.ts            # Point calculation logic
│   │   ├── difficulty.ts         # Difficulty selection algorithm
│   │   ├── streaks.ts            # Streak tracking
│   │   └── achievements.ts       # Achievement checking logic
│   ├── audio/
│   │   ├── SoundManager.ts       # SFX playback (expo-av)
│   │   ├── MusicEngine.ts        # Background music
│   │   └── sounds.ts             # Sound asset references
│   ├── stores/
│   │   ├── gameStore.ts          # Zustand — game state
│   │   ├── authStore.ts          # Zustand — user/auth state
│   │   └── settingsStore.ts      # Zustand — user preferences
│   ├── utils/
│   │   ├── formatters.ts         # Number formatting, time formatting
│   │   ├── share.ts              # Social sharing helpers
│   │   ├── haptics.ts            # Haptic feedback wrapper
│   │   └── constants.ts          # App constants, config
│   └── types/
│       ├── question.ts           # Question, Category, Difficulty types
│       ├── user.ts               # User, Profile types
│       ├── game.ts               # GameState, GameResult types
│       ├── leaderboard.ts        # LeaderboardEntry types
│       └── achievement.ts        # Achievement types
│
├── assets/                       # Static assets
│   ├── images/
│   │   ├── logo.png              # App logo
│   │   ├── icon.png              # App icon (1024x1024)
│   │   ├── splash.png            # Splash screen
│   │   ├── adaptive-icon.png     # Android adaptive icon
│   │   ├── frenchie-avatars/     # 20+ Frenchie avatar options
│   │   └── category-icons/       # Icons per category
│   ├── audio/
│   │   ├── sfx/                  # Sound effects (bundled)
│   │   │   ├── correct.mp3
│   │   │   ├── wrong.mp3
│   │   │   ├── tick.mp3
│   │   │   ├── streak.mp3
│   │   │   ├── victory.mp3
│   │   │   ├── bark-happy.mp3
│   │   │   ├── bark-sad.mp3
│   │   │   ├── whoosh.mp3
│   │   │   └── achievement.mp3
│   │   ├── music/                # Background music (royalty-free)
│   │   │   ├── menu-theme.mp3
│   │   │   ├── game-easy.mp3
│   │   │   ├── game-intense.mp3
│   │   │   └── victory-theme.mp3
│   │   └── tts/                  # Pre-generated TTS (optional, downloaded on demand)
│   └── fonts/                    # Custom fonts if needed
│
├── workers/                      # Cloudflare Workers backend
│   ├── src/
│   │   ├── index.ts              # Hono.js app entry point
│   │   ├── routes/
│   │   │   ├── auth.ts           # POST /auth/register, /auth/login, /auth/guest
│   │   │   ├── questions.ts      # GET /questions, GET /questions/version
│   │   │   ├── scores.ts         # POST /scores, GET /scores/me
│   │   │   ├── leaderboard.ts    # GET /leaderboard, GET /leaderboard/rank
│   │   │   ├── achievements.ts   # GET /achievements, POST /achievements
│   │   │   ├── profile.ts        # GET /profile, PATCH /profile
│   │   │   └── admin.ts          # Admin endpoints (protected)
│   │   ├── middleware/
│   │   │   ├── auth.ts           # JWT verification middleware
│   │   │   ├── rateLimit.ts      # Rate limiting via Upstash
│   │   │   └── cors.ts           # CORS headers
│   │   ├── services/
│   │   │   ├── leaderboard.ts    # Upstash Redis leaderboard logic
│   │   │   ├── achievements.ts   # Achievement evaluation
│   │   │   ├── scoring.ts        # Server-side score validation
│   │   │   └── questionBank.ts   # Question selection algorithm
│   │   ├── db/
│   │   │   ├── schema.sql        # D1 database schema
│   │   │   └── seed.sql          # Initial question data
│   │   └── types.ts              # Shared types
│   ├── wrangler.toml             # Workers configuration
│   ├── package.json
│   └── tsconfig.json
│
├── scripts/                      # Build & utility scripts
│   ├── seed-questions.ts         # Import questions to D1
│   ├── generate-tts.ts           # Pre-generate TTS audio
│   ├── validate-questions.ts     # Lint question bank for errors
│   └── generate-share-images.ts  # Generate sharing templates
│
├── docs/                         # Documentation
│   ├── BUILD_PLAN.md             # This file
│   ├── QUESTION_WRITING_GUIDE.md # Guidelines for writing questions
│   ├── API_REFERENCE.md          # API endpoint documentation
│   └── DEPLOYMENT.md             # Deployment procedures
│
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build configuration
├── package.json
├── tsconfig.json
├── tailwind.config.js            # NativeWind config
├── .env.example                  # Environment variables template
├── .gitignore
├── CHANGELOG.md
└── README.md
```

---

## 5. Development Phases

### Timeline Overview

| Phase | Duration | Milestone |
|-------|----------|-----------|
| **Phase 1** — Foundation & Web MVP | 2 weeks | Playable web version in Safari on iPhone |
| **Phase 2** — Core Game Engine | 2 weeks | Full game loop with 500+ questions |
| **Phase 3** — User System & Leaderboard | 2 weeks | Registration, login, global leaderboard |
| **Phase 4** — Audio, Polish & Monetisation | 2 weeks | SFX, music, ads, IAP, achievements |
| **Phase 5** — Native Build & Submission | 1 week | iOS & Android builds, store submissions |
| **Phase 6** — Post-Launch & Growth | Ongoing | Marketing, content updates, seasonal events |
| **Total to App Store:** | **~9 weeks** | |

---

## 6. Phase 1 — Foundation & Web MVP

**Goal:** Scaffold the project, set up all tooling, and get a playable trivia game running in Safari on iPhone via Expo Go.

### 1.1 — Project initialisation

```bash
# Create Expo project with TypeScript + Expo Router
npx create-expo-app frenchie-trivia -t tabs
cd frenchie-trivia

# Install core dependencies
npx expo install expo-router expo-av expo-haptics expo-secure-store
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install @react-native-async-storage/async-storage

# State management
npm install zustand @tanstack/react-query

# Styling
npm install nativewind tailwindcss

# Dev tools
npm install -D typescript @types/react
```

### 1.2 — Expo configuration (app.json)

```json
{
  "expo": {
    "name": "Frenchie Trivia",
    "slug": "frenchie-trivia",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "frenchietrivia",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a1035"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.frenchietrivia.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSMicrophoneUsageDescription": "Not required",
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#1a1035"
      },
      "package": "com.frenchietrivia.app",
      "versionCode": 1
    },
    "web": {
      "bundler": "metro",
      "output": "single",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ],
    "extra": {
      "eas": {
        "projectId": "YOUR_EAS_PROJECT_ID"
      }
    }
  }
}
```

### 1.3 — EAS configuration (eas.json)

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### 1.4 — Cloudflare Workers backend scaffold

```bash
# In the workers/ directory
npm create cloudflare@latest -- workers --type hello-world --ts
cd workers
npm install hono @tsndr/cloudflare-worker-jwt @upstash/redis
```

**`workers/wrangler.toml`:**
```toml
name = "frenchie-trivia-api"
main = "src/index.ts"
compatibility_date = "2024-12-01"

[[d1_databases]]
binding = "DB"
database_name = "frenchie-trivia-db"
database_id = "" # Filled after creation

[[kv_namespaces]]
binding = "CACHE"
id = "" # Filled after creation

[vars]
ENVIRONMENT = "production"
JWT_SECRET = "" # Set in dashboard or wrangler secret

[[r2_buckets]]
binding = "AUDIO"
bucket_name = "frenchie-trivia-audio"
```

### 1.5 — Phase 1 deliverables checklist

- [ ] Expo project scaffolded with TypeScript + Expo Router
- [ ] NativeWind (Tailwind) configured and working
- [ ] Basic screen navigation: Home → Setup → Play → Results
- [ ] Hardcoded 50 questions playing correctly in Expo Go on iPhone
- [ ] Timer bar with countdown animation
- [ ] Basic score tracking (no persistence)
- [ ] Frenchie-themed colour palette applied
- [ ] Cloudflare Workers backend deployed with `/health` endpoint
- [ ] D1 database created with initial schema
- [ ] Web export tested in Safari on iPhone

---

## 7. Phase 2 — Core Game Engine

**Goal:** Build the full game experience with 500+ questions, animations, difficulty scaling, streaks, and all game modes.

### 2.1 — Game state machine

```typescript
// lib/game/engine.ts
type GamePhase =
  | 'idle'           // On home screen
  | 'setup'          // Choosing category/mode
  | 'countdown'      // 3-2-1 before first question
  | 'reading'        // TTS playing (if enabled)
  | 'answering'      // Timer running, waiting for tap
  | 'reveal'         // Answer cascade animation
  | 'feedback'       // "Pawfect!" overlay
  | 'transition'     // Between questions
  | 'results'        // Game over screen
  | 'error';         // Error state

interface GameState {
  phase: GamePhase;
  mode: 'casual' | 'ranked' | 'daily' | 'challenge';
  category: string | null;         // null = all categories
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard';
  totalRounds: number;             // 10, 15, 20
  currentRound: number;
  questions: Question[];
  currentQuestion: Question | null;
  answers: ShuffledAnswer[];
  selectedAnswerIndex: number | null;
  score: number;
  streak: number;
  bestStreak: number;
  correctCount: number;
  timeLeft: number;
  timerDuration: number;
  speedBonus: number;
  answered: boolean;
}
```

### 2.2 — Scoring system (carried from BRAINBLITZ, enhanced)

```typescript
// lib/game/scoring.ts
function calculatePoints(
  isCorrect: boolean,
  timeLeft: number,
  timerDuration: number,
  streak: number,
  difficulty: 1 | 2 | 3
): { total: number; base: number; speed: number; streak: number; difficulty: number } {
  if (!isCorrect) return { total: 0, base: 0, speed: 0, streak: 0, difficulty: 0 };

  const diffMultiplier = difficulty === 1 ? 1 : difficulty === 2 ? 1.5 : 2;
  const base = Math.round(100 * diffMultiplier);
  const speed = Math.round((timeLeft / timerDuration) * 100);
  const streakBonus = Math.min(streak, 5) * 20;

  return {
    total: base + speed + streakBonus,
    base,
    speed,
    streak: streakBonus,
    difficulty: difficulty
  };
}
```

### 2.3 — Question fetching with offline cache

```typescript
// lib/api/questions.ts
// Questions are cached locally and only re-fetched when the server version changes
// This means the game works offline after first load

async function getQuestions(category?: string): Promise<Question[]> {
  const localVersion = await AsyncStorage.getItem('questions_version');
  const serverVersion = await fetch(`${API_URL}/questions/version`).then(r => r.text());

  if (localVersion === serverVersion) {
    const cached = await AsyncStorage.getItem('questions_cache');
    if (cached) return JSON.parse(cached);
  }

  const questions = await fetch(`${API_URL}/questions?category=${category || ''}`).then(r => r.json());
  await AsyncStorage.setItem('questions_cache', JSON.stringify(questions));
  await AsyncStorage.setItem('questions_version', serverVersion);
  return questions;
}
```

### 2.4 — Game modes

| Mode | Description | Scoring |
|------|-------------|---------|
| **Casual** | Practice mode, no leaderboard impact | Points shown but not submitted |
| **Ranked** | Affects global leaderboard position | Server-validated scores submitted |
| **Daily Challenge** | Same 10 questions for all players each day | Score + time compared globally |
| **Challenge a Friend** | Share a game code, friend plays same questions | Side-by-side comparison |

### 2.5 — Frenchie-themed feedback expressions

Replace all SA Afrikaans expressions:

| Event | Expressions (randomly selected) |
|-------|-------------------------------|
| **Correct answer** | "Pawfect! 🐾", "Good boy! 🐕", "Tail wags! 🐕‍🦺", "Treat earned! 🦴", "Top dog! 🏆", "Fetch that point!", "Barking brilliant!", "Snoot boop! 👃" |
| **Wrong answer** | "Ruff luck! 🐾", "Uh-oh, walkies over! 🚶", "Back to the crate!", "Oops, wrong paw!", "Not this time, pup!", "Squished that one!" |
| **Timeout** | "Too slow, sleepy Frenchie! 😴", "Snoring on the job! 💤" |
| **Streak 3+** | "ON A WALK! 🐕", "Zoomies mode! 💨" |
| **Streak 5+** | "ALPHA FRENCHIE! 🔥👑", "UNSTOPPABLE! 🐾🔥" |
| **Win** | "Champion Frenchie Expert! 🏆🐕", "Best in Show! 🎀" |

### 2.6 — Phase 2 deliverables checklist

- [ ] Full game state machine implemented
- [ ] 500+ questions loaded from D1 (seeded)
- [ ] Difficulty scaling (easy/medium/hard) with visual indicators
- [ ] Answer cascade animation
- [ ] Streak tracking with celebration at 5+
- [ ] Speed scoring with bonus popup
- [ ] Timer with danger pulse at <30%
- [ ] Round splash between questions
- [ ] Results screen with stats breakdown
- [ ] 4 game modes selectable from setup screen
- [ ] Category filtering
- [ ] Question caching for offline play
- [ ] Haptic feedback on answer selection
- [ ] All Frenchie-themed feedback expressions

---

## 8. Phase 3 — User System & Leaderboard

**Goal:** Implement registration, login, user profiles, and the global ranked leaderboard.

### 3.1 — Authentication flow (see §16 for full detail)

1. **First launch:** Auto-create anonymous guest account (UUID + fun auto-name)
2. **Optional upgrade:** Prompt to create account (email/password or Apple/Google Sign-In)
3. **Benefits of account:** Cross-device sync, permanent leaderboard position, social features

### 3.2 — User profile features

- Custom display name (profanity-filtered, 3–20 chars)
- Frenchie avatar selection (20+ cute Frenchie icons)
- Lifetime stats (games, wins, accuracy, best streak, total score)
- Achievement gallery
- Level / XP progress bar
- Share profile card

### 3.3 — Global leaderboard

- **All-time** rankings by total score
- **Weekly** rankings (reset every Monday)
- **Monthly** rankings (reset on 1st)
- **Seasonal** rankings (3-month seasons, special rewards)
- **Daily Challenge** separate leaderboard
- Top 3 displayed on podium with gold/silver/bronze
- User's own rank always visible (even if outside top 100)
- Pull-to-refresh, infinite scroll

### 3.4 — XP and levelling system

| Level | XP required | Title |
|-------|-------------|-------|
| 1–5 | 0–500 | Frenchie Pup 🐶 |
| 6–10 | 500–2,000 | Frenchie Fan 🐕 |
| 11–20 | 2,000–10,000 | Frenchie Enthusiast 🐾 |
| 21–35 | 10,000–35,000 | Frenchie Expert 🎓 |
| 36–50 | 35,000–80,000 | Frenchie Master 👑 |
| 50+ | 80,000+ | Frenchie Champion 🏆 |

XP earned = total game score. Level titles displayed on leaderboard and profile.

### 3.5 — Phase 3 deliverables checklist

- [ ] Guest auto-registration (anonymous UUID)
- [ ] Email/password registration
- [ ] Apple Sign-In integration
- [ ] Google Sign-In integration
- [ ] JWT-based session management
- [ ] User profile screen with stats
- [ ] Display name editing with profanity filter
- [ ] Avatar selection (20 Frenchie avatars)
- [ ] XP and level system
- [ ] Global leaderboard — all-time, weekly, monthly
- [ ] Daily Challenge mode with separate leaderboard
- [ ] Upstash Redis sorted set leaderboard
- [ ] User rank lookup ("You are #4,512 globally")
- [ ] Pull-to-refresh on leaderboard

---

## 9. Phase 4 — Audio, Polish & Monetisation

**Goal:** Add sound effects, background music, ads, in-app purchases, achievements, and visual polish.

### 4.1 — Audio implementation

See §19 for full audio strategy. Key implementation:

```typescript
// lib/audio/SoundManager.ts
import { Audio } from 'expo-av';

class SoundManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private musicPlayer: Audio.Sound | null = null;
  private sfxEnabled: boolean = true;
  private musicEnabled: boolean = true;

  async preload() {
    // Preload all SFX at app startup
    const sfxFiles = {
      correct: require('../../assets/audio/sfx/correct.mp3'),
      wrong: require('../../assets/audio/sfx/wrong.mp3'),
      tick: require('../../assets/audio/sfx/tick.mp3'),
      streak: require('../../assets/audio/sfx/streak.mp3'),
      victory: require('../../assets/audio/sfx/victory.mp3'),
      bark_happy: require('../../assets/audio/sfx/bark-happy.mp3'),
      bark_sad: require('../../assets/audio/sfx/bark-sad.mp3'),
      whoosh: require('../../assets/audio/sfx/whoosh.mp3'),
      achievement: require('../../assets/audio/sfx/achievement.mp3'),
    };

    for (const [key, file] of Object.entries(sfxFiles)) {
      const { sound } = await Audio.Sound.createAsync(file);
      this.sounds.set(key, sound);
    }
  }

  async playSFX(name: string) {
    if (!this.sfxEnabled) return;
    const sound = this.sounds.get(name);
    if (sound) {
      await sound.replayAsync();
    }
  }
}
```

### 4.2 — Monetisation — RevenueCat + AdMob

**Free tier includes:**
- All core game modes (casual, ranked)
- 50 free questions per category
- Ads between every 3rd game

**Premium unlocks ($0.99 ad removal, or $4.99 "Ultimate Frenchie Expert" bundle):**
- Ad-free experience
- All 2,000+ questions unlocked
- Exclusive avatar set
- Daily Challenge mode
- Challenge-a-friend mode

**Ad placement:**
- Interstitial ad between games (every 3rd game)
- Rewarded video: "Watch ad for 2x points next round" (optional, user-initiated)
- Banner ad on results screen (non-intrusive)
- **Never** during active gameplay

### 4.3 — Expanded achievements (30+)

| ID | Name | Icon | Description |
|----|------|------|-------------|
| first_game | First Steps | 🐾 | Complete your first game |
| perfect_10 | Perfect 10 | ⭐ | Answer all 10 questions correctly |
| speed_demon | Speed Demon | ⚡ | Answer 5 questions in under 2 seconds |
| streak_5 | On a Walk | 🐕 | Get a 5-answer streak |
| streak_10 | Zoomies | 💨 | Get a 10-answer streak |
| century | Century Club | 💯 | Score 1,000+ in a single game |
| high_roller | High Roller | 🎰 | Score 2,000+ in a single game |
| daily_warrior | Daily Warrior | 📅 | Complete 7 daily challenges in a row |
| category_master | Breed Expert | 🎓 | Get 90%+ in every category |
| health_hero | Health Hero | 🏥 | Answer 50 health questions correctly |
| history_buff | History Buff | 📚 | Answer 50 history questions correctly |
| social_butterfly | Social Butterfly | 🦋 | Share your score 5 times |
| night_owl | Night Owl | 🦉 | Play a game after midnight |
| early_bird | Early Bird | 🐦 | Play a game before 7am |
| global_top_100 | Top Dog | 🏆 | Reach the top 100 on global leaderboard |
| level_10 | Rising Star | 🌟 | Reach level 10 |
| level_25 | Expert Class | 🎓 | Reach level 25 |
| level_50 | Legend | 👑 | Reach level 50 |
| marathon | Marathon | 🏃 | Play 100 games total |
| blitz | Blitz | 💫 | Answer correctly in under 1 second |
| comeback | Comeback King | 🔥 | Win after trailing by 200+ points |
| nail_biter | Nail Biter | 😬 | Win by fewer than 50 points |
| domination | Domination | 👑 | Win by 500+ points |
| hard_mode | Challenge Accepted | 💪 | Complete a game on hard difficulty only |
| no_mistakes | Flawless | 💎 | Complete a 20-round game with no mistakes |
| explorer | Explorer | 🗺️ | Play every category at least once |
| consistent | Old Faithful | 🔁 | Play 5 days in a row |
| weekend_warrior | Weekend Warrior | 🎉 | Play 10 games in a single weekend |
| fast_fingers | Fast Fingers | ✋ | Average answer time under 3 seconds in a game |
| trivia_titan | Trivia Titan | 🐕‍🦺 | Earn every other achievement |

### 4.4 — Visual polish

- **Frenchie-themed colour palette:**
  - Primary: `#6C5CE7` (soft purple)
  - Secondary: `#FDA085` (peach/salmon)
  - Accent: `#00CEC9` (teal)
  - Correct: `#00B894` (green)
  - Wrong: `#E17055` (coral)
  - Background: `#1A1035` (deep purple-dark)
  - Card: `rgba(30, 20, 60, 0.85)`

- **Animations (Reanimated 3):**
  - Answer button press: scale down 0.95 → bounce back
  - Correct answer: pulse glow green + check mark appear
  - Wrong answer: shake left-right + X mark
  - Score change: number counter animation
  - Timer: smooth shrink with danger pulse
  - Screen transitions: shared element + fade
  - Confetti: react-native-confetti-cannon

### 4.5 — Phase 4 deliverables checklist

- [ ] Sound effects preloaded and playing for all game events
- [ ] Background music — menu, game, victory, draw tracks
- [ ] Mute toggle for SFX and music separately
- [ ] AdMob interstitial ads between games
- [ ] AdMob rewarded video for 2x points
- [ ] RevenueCat integration for IAP
- [ ] Ad removal purchase ($0.99)
- [ ] Premium question pack purchase ($4.99)
- [ ] 30 achievements implemented and tracked
- [ ] Achievement toast notifications
- [ ] Achievement gallery screen
- [ ] Share card generation (result image for Instagram/TikTok)
- [ ] Native share sheet integration
- [ ] Visual polish pass — all animations, transitions, colours
- [ ] Haptic feedback on all interactive elements
- [ ] Settings screen: SFX volume, music volume, notifications

---

## 10. Phase 5 — Native Mobile Build & App Store Submission

**Goal:** Build production binaries and submit to both app stores.

### 5.1 — Pre-submission checklist

- [ ] All screens tested on iPhone 15 Pro Max via Expo Go
- [ ] Android tested on physical device or emulator
- [ ] No console errors or warnings
- [ ] Privacy policy URL created and hosted
- [ ] Terms of service URL created and hosted
- [ ] App Store screenshots captured (6.7" and 6.1" iPhone)
- [ ] Play Store screenshots captured (phone + optional tablet)
- [ ] App icon finalised (1024x1024, no alpha, no rounded corners for iOS)
- [ ] Promotional text written
- [ ] Keywords researched (ASO)
- [ ] Age rating questionnaire completed (likely 4+)
- [ ] IDFA/ATT consent implemented (iOS)
- [ ] App Store review guidelines compliance verified
- [ ] Google Play 20-tester / 14-day requirement completed (if new account)

### 5.2 — Build commands

```bash
# iOS production build (runs in EAS cloud — no Mac needed)
eas build --platform ios --profile production

# Android production build
eas build --platform android --profile production

# Submit to App Store
eas submit --platform ios --profile production

# Submit to Google Play
eas submit --platform android --profile production
```

### 5.3 — App Store metadata

**App name:** Frenchie Trivia — Dog Quiz Game
**Subtitle:** How well do you know your Frenchie?
**Category:** Games > Trivia
**Secondary category:** Education > Reference

**Keywords (iOS, 100 chars max):**
`french bulldog,frenchie,dog quiz,trivia,breed,puppy,pet,bulldog,dog trivia,quiz game`

**Description (first paragraph is crucial):**
> Think you know everything about French Bulldogs? Prove it! Frenchie Trivia is the ultimate quiz game for Frenchie lovers, with 2,000+ questions covering breed history, health, genetics, famous Frenchies, puppy care, and more. Compete on the global leaderboard, earn achievements, and challenge your friends. From "What colour is the rarest Frenchie coat?" to "Why can't French Bulldogs swim?" — test your knowledge and become the ultimate Frenchie Expert! 🐾

### 5.4 — Phase 5 deliverables checklist

- [ ] Production iOS build successful
- [ ] Production Android build successful
- [ ] iOS build submitted to App Store Connect
- [ ] Android build submitted to Google Play Console
- [ ] App Store review passed
- [ ] Google Play review passed
- [ ] **v1.0.0 LIVE on both stores** 🎉

---

## 11. Phase 6 — Post-Launch & Growth

**Goal:** Drive downloads, iterate on feedback, and expand content.

### 6.1 — Week 1 post-launch

- Monitor crash reports (Sentry)
- Monitor analytics (PostHog)
- Respond to all app store reviews
- Fix critical bugs via OTA update (EAS Update — no store review needed)
- Social media launch posts on Frenchie groups

### 6.2 — Ongoing content updates

- **Monthly:** Add 100+ new questions
- **Seasonal:** New seasonal leaderboard every 3 months with themed questions
- **Holiday events:** Christmas Frenchie quiz, Valentine's "Frenchie Love" quiz, Halloween "Spooky Frenchie" quiz
- **Community:** Accept question submissions from users

### 6.3 — Feature roadmap (post-launch)

| Priority | Feature | Phase |
|----------|---------|-------|
| High | Push notifications (daily challenge reminders) | Month 1 |
| High | Social sharing with custom share cards | Month 1 |
| Medium | Multiplayer real-time mode (head-to-head) | Month 2–3 |
| Medium | Picture round (identify Frenchie colours/features) | Month 2 |
| Medium | Localisation (Spanish, French, German) | Month 3 |
| Low | AR Frenchie avatar that reacts to answers | Month 4+ |
| Low | Breed comparison mode (Frenchie vs other breeds) | Month 4+ |

---

## 12. Question Bank Architecture

### Storage approach

Questions live in **Cloudflare D1** as the source of truth. On first app launch and periodically thereafter, questions are synced to local storage via a versioned cache:

1. App checks `GET /questions/version` → returns a hash string
2. If hash matches local, use cached questions (instant, offline-capable)
3. If hash differs, fetch `GET /questions` → full question set
4. Save to AsyncStorage with new version hash

### Question schema

```typescript
interface Question {
  id: string;              // UUID
  category: string;        // e.g. "Breed History"
  subcategory?: string;    // e.g. "19th Century Origins"
  question: string;        // The question text
  correct_answer: string;  // Correct answer
  incorrect_answers: string[];  // 3 wrong answers (or 1 for True/False)
  difficulty: 1 | 2 | 3;  // 1=easy, 2=medium, 3=hard
  explanation?: string;    // "Did you know?" shown after answering
  image_url?: string;      // Optional image (for picture rounds)
  source?: string;         // Citation (AKC, veterinary journal, etc.)
  tags: string[];          // Searchable tags
  is_premium: boolean;     // Requires premium unlock
  created_at: string;      // ISO date
}
```

### Question selection algorithm

1. Filter by selected category (or all if "Any")
2. Filter out recently-seen questions (last 3 sessions, stored locally)
3. Distribute by difficulty: first third easy, middle third medium, final third hard
4. Shuffle within each difficulty tier
5. If fewer questions than requested rounds, auto-adjust round count

### Target: 2,000+ questions at launch

Each category should have **100–200 questions** across all difficulty levels, with a 30/40/30 split (easy/medium/hard).

---

## 13. Question Categories — All Frenchie-Themed

### Category breakdown (15 categories, 2,000+ total questions)

| # | Category | Icon | Description | Target Qs |
|---|----------|------|-------------|-----------|
| 1 | **Breed History** | 📜 | Origins in England, journey to France, AKC recognition, historical milestones | 150 |
| 2 | **Health & Wellness** | 🏥 | BOAS, cherry eye, skin fold care, spine issues, heatstroke prevention, diet | 200 |
| 3 | **Genetics & Colours** | 🧬 | Coat colour genetics, rare colours (blue, lilac, merle), breeding science, DNA | 150 |
| 4 | **Anatomy & Appearance** | 🐕 | Bat ears, body structure, breed standard, size, weight, physical features | 100 |
| 5 | **Personality & Behaviour** | 🧠 | Temperament, training, socialisation, sleep habits, quirky behaviours | 120 |
| 6 | **Famous Frenchies** | ⭐ | Celebrity Frenchie owners, Instagram-famous Frenchies, Frenchies in media | 120 |
| 7 | **Puppy Care** | 🍼 | Whelping, puppy development stages, vaccination, first-year milestones | 120 |
| 8 | **Nutrition & Diet** | 🦴 | Food allergies, best diets, toxic foods, weight management, treats | 100 |
| 9 | **Training Tips** | 🎾 | Obedience, crate training, potty training, trick training, stubborn streak | 100 |
| 10 | **Frenchie vs The World** | 🌍 | Comparing Frenchies to other breeds, breed popularity rankings, global stats | 100 |
| 11 | **Pop Culture** | 🎬 | Frenchies in movies, TV shows, advertising, art, memes, viral moments | 100 |
| 12 | **True or False** | ✅❌ | Common myths vs facts about French Bulldogs | 150 |
| 13 | **Picture Round** | 📸 | Identify Frenchie coat colours, age, mix vs purebred (uses images) | 80 |
| 14 | **Speed Round** | ⚡ | Quick-fire easy questions, 5-second timer | 100 |
| 15 | **Expert Only** | 🎓 | Deep breed knowledge — genetics, show standards, rare historical facts | 100 |
| | **TOTAL** | | | **~1,790** |

*Additional questions added from sub-topics and community submissions to reach 2,000+*

### Example questions per category

**Breed History (Easy):**
> Q: What country did French Bulldogs originally come from before becoming popular in France?
> A: England ✅ | Germany | Spain | Belgium

**Health & Wellness (Medium):**
> Q: What is the medical term for the breathing condition caused by a Frenchie's flat face?
> A: Brachycephalic Obstructive Airway Syndrome ✅ | Tracheal Collapse | Laryngeal Paralysis | Chronic Bronchitis

**Genetics & Colours (Hard):**
> Q: Which two dilution genes must both be present for a French Bulldog to have a lilac coat?
> A: Blue (d/d) and chocolate (b/b) ✅ | Blue (d/d) and cream (e/e) | Chocolate (b/b) and brindle (Kbr) | Cream (e/e) and fawn (Ay)

**Famous Frenchies (Easy):**
> Q: Which celebrity had their French Bulldogs stolen in a high-profile 2021 incident?
> A: Lady Gaga ✅ | Kim Kardashian | The Rock | David Beckham

**True or False (Medium):**
> Q: French Bulldogs can naturally give birth without veterinary assistance — true or false?
> A: False ✅ | True
> *Explanation: Over 80% of Frenchie litters are delivered via C-section due to the puppies' large heads relative to the mother's narrow hips.*

---

## 14. Database Schema

### D1 Schema (`workers/src/db/schema.sql`)

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                    -- UUID
  device_id TEXT,                         -- First device UUID
  email TEXT UNIQUE,                      -- Nullable for guests
  display_name TEXT NOT NULL,             -- "BraveFrenchie42"
  avatar_id TEXT DEFAULT 'default',       -- Frenchie avatar choice
  auth_provider TEXT DEFAULT 'anonymous', -- anonymous | email | apple | google
  firebase_uid TEXT UNIQUE,              -- Firebase Auth UID (when upgraded)
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  best_game_score INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  current_daily_streak INTEGER DEFAULT 0,
  longest_daily_streak INTEGER DEFAULT 0,
  is_premium INTEGER DEFAULT 0,          -- 0 = free, 1 = premium
  is_banned INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  last_played_at TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_display_name ON users(display_name);
CREATE INDEX idx_users_total_xp ON users(total_xp DESC);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,                    -- UUID
  category TEXT NOT NULL,
  subcategory TEXT,
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  incorrect_answer_1 TEXT NOT NULL,
  incorrect_answer_2 TEXT NOT NULL,
  incorrect_answer_3 TEXT,               -- Nullable for True/False
  difficulty INTEGER NOT NULL CHECK(difficulty IN (1, 2, 3)),
  explanation TEXT,
  image_url TEXT,
  source TEXT,
  tags TEXT,                             -- JSON array as text
  is_premium INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_premium ON questions(is_premium);

-- Game history
CREATE TABLE IF NOT EXISTS game_history (
  id TEXT PRIMARY KEY,                    -- UUID
  user_id TEXT NOT NULL REFERENCES users(id),
  mode TEXT NOT NULL,                    -- casual | ranked | daily | challenge
  category TEXT,                         -- null = mixed
  total_rounds INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  score INTEGER NOT NULL,
  best_streak INTEGER NOT NULL,
  average_time REAL,                     -- Average answer time in seconds
  difficulty_distribution TEXT,          -- JSON: {"easy": 5, "medium": 3, "hard": 2}
  completed_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_game_history_user ON game_history(user_id);
CREATE INDEX idx_game_history_mode ON game_history(mode);
CREATE INDEX idx_game_history_completed ON game_history(completed_at);

-- Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id TEXT PRIMARY KEY,                    -- UUID
  user_id TEXT NOT NULL REFERENCES users(id),
  achievement_id TEXT NOT NULL,
  earned_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_achievements_user ON user_achievements(user_id);

-- Daily challenge
CREATE TABLE IF NOT EXISTS daily_challenges (
  date TEXT PRIMARY KEY,                  -- YYYY-MM-DD
  question_ids TEXT NOT NULL,            -- JSON array of 10 question IDs
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS daily_challenge_scores (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  challenge_date TEXT NOT NULL REFERENCES daily_challenges(date),
  score INTEGER NOT NULL,
  time_taken REAL NOT NULL,              -- Total seconds
  correct_count INTEGER NOT NULL,
  completed_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, challenge_date)
);

CREATE INDEX idx_daily_scores_date ON daily_challenge_scores(challenge_date);
CREATE INDEX idx_daily_scores_score ON daily_challenge_scores(score DESC);

-- Question versioning (for client cache invalidation)
CREATE TABLE IF NOT EXISTS question_versions (
  id INTEGER PRIMARY KEY CHECK(id = 1),  -- Singleton row
  version_hash TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);
```

---

## 15. API Design

### Base URL

- **Development:** `http://localhost:8787`
- **Production:** `https://api.frenchietrivia.com` (custom domain on Workers)

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/guest` | None | Create anonymous guest account |
| `POST` | `/auth/register` | None | Register with email/password |
| `POST` | `/auth/login` | None | Login with email/password |
| `POST` | `/auth/firebase` | Firebase token | Login/register via Firebase |
| `GET` | `/auth/me` | JWT | Get current user profile |
| `PATCH` | `/profile` | JWT | Update display name, avatar |
| `GET` | `/questions/version` | JWT | Get question bank version hash |
| `GET` | `/questions` | JWT | Get all active questions |
| `GET` | `/questions?category=Health` | JWT | Get questions by category |
| `POST` | `/scores` | JWT | Submit game result |
| `GET` | `/scores/me` | JWT | Get user's game history |
| `GET` | `/leaderboard` | JWT | Get global top 100 |
| `GET` | `/leaderboard/weekly` | JWT | Get weekly top 100 |
| `GET` | `/leaderboard/monthly` | JWT | Get monthly top 100 |
| `GET` | `/leaderboard/rank` | JWT | Get user's rank |
| `GET` | `/leaderboard/daily/:date` | JWT | Get daily challenge rankings |
| `GET` | `/achievements` | JWT | Get user's achievements |
| `POST` | `/achievements` | JWT | Unlock achievements (server-validated) |
| `GET` | `/daily-challenge` | JWT | Get today's challenge questions |
| `POST` | `/daily-challenge/score` | JWT | Submit daily challenge score |

### Response format

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### Error format

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Authentication token has expired"
  }
}
```

### Rate limiting

| Endpoint group | Limit |
|---------------|-------|
| Auth endpoints | 10 req/minute per IP |
| Score submission | 20 req/minute per user |
| Leaderboard reads | 60 req/minute per user |
| Question fetch | 10 req/minute per user |
| All other | 100 req/minute per user |

Rate limiting implemented via Upstash Redis `@upstash/ratelimit`.

---

## 16. Authentication Flow

### Phase 1 (Launch): Anonymous + Email

```
┌─────────────────┐
│   First Launch   │
│  Generate UUID   │
│  Auto-name user  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  POST /auth/guest│────▶│  Returns JWT +   │
│  { device_id }   │     │  user profile    │
└─────────────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐
│   Play as guest  │
│  (full access    │
│   to core game)  │
└────────┬────────┘
         │
         ▼ (optional, prompted after 3rd game)
┌─────────────────┐     ┌──────────────────┐
│ POST /auth/register───▶│  Upgrades guest  │
│ { email, password,│     │  to full account │
│   device_id }    │     │  Preserves stats │
└─────────────────┘     └──────────────────┘
```

### JWT structure

```json
{
  "sub": "user-uuid-here",
  "iat": 1708000000,
  "exp": 1710592000,    // 30-day expiry
  "type": "access",
  "premium": false
}
```

### Token management

- Access token: 30-day expiry, stored in SecureStore
- Refresh token: 90-day expiry, used to get new access token
- On 401 response: attempt refresh, if fails → prompt re-login
- Guest tokens auto-renew silently

---

## 17. Global Leaderboard System

### Backend: Upstash Redis Sorted Sets

```typescript
// workers/src/services/leaderboard.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });

// Keys
const LEADERBOARD_ALLTIME = 'lb:alltime';
const LEADERBOARD_WEEKLY = `lb:weekly:${getCurrentWeek()}`;
const LEADERBOARD_MONTHLY = `lb:monthly:${getCurrentMonth()}`;

// Add/update score
async function updateLeaderboard(userId: string, score: number) {
  await redis.zincrby(LEADERBOARD_ALLTIME, score, userId);
  await redis.zincrby(LEADERBOARD_WEEKLY, score, userId);
  await redis.zincrby(LEADERBOARD_MONTHLY, score, userId);

  // Set weekly/monthly expiry
  await redis.expire(LEADERBOARD_WEEKLY, 7 * 24 * 60 * 60);
  await redis.expire(LEADERBOARD_MONTHLY, 31 * 24 * 60 * 60);
}

// Get top N
async function getTopPlayers(key: string, count: number = 100) {
  return redis.zrevrange(key, 0, count - 1, { withScores: true });
}

// Get user's rank (0-indexed, so add 1)
async function getUserRank(key: string, userId: string) {
  const rank = await redis.zrevrank(key, userId);
  const score = await redis.zscore(key, userId);
  return { rank: rank !== null ? rank + 1 : null, score };
}
```

### Leaderboard display data

When displaying the leaderboard, fetch user profiles (display_name, avatar_id, level) from D1 for the top 100 user IDs returned by Redis. Cache this in KV for 60 seconds.

---

## 18. Monetisation Strategy

### Revenue model: Freemium + Ads

```
┌──────────────────────────────────────────────────┐
│                   FREE TIER                       │
│  • Core game (casual + ranked)                    │
│  • 50 questions per category (750 total)          │
│  • Global leaderboard                             │
│  • Basic achievements                             │
│  • Interstitial ad every 3rd game                 │
│  • Banner ad on results screen                    │
└───────────────────────┬──────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Remove Ads  │ │  Question    │ │  Ultimate    │
│   $0.99      │ │  Packs       │ │  Bundle      │
│              │ │  $1.99 each  │ │  $4.99       │
│  No ads,     │ │  Unlock all  │ │  Everything: │
│  that's it   │ │  200+ Qs in  │ │  Ad-free +   │
│              │ │  a category  │ │  All Qs +    │
│              │ │              │ │  Exclusive   │
│              │ │              │ │  avatars +   │
│              │ │              │ │  Daily mode  │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Revenue projections (Year 1)

| Source | Pessimistic (5K downloads) | Realistic (25K) | Optimistic (100K) |
|--------|---------------------------|-----------------|-------------------|
| Ad revenue (interstitial + banner) | R8,400/yr | R58,500/yr | R300,000/yr |
| Ad removal ($0.99) — 3% conversion | R2,775 | R13,875 | R55,500 |
| Question packs ($1.99) — 2% conversion | R3,700 | R18,500 | R74,000 |
| Ultimate bundle ($4.99) — 1% conversion | R4,625 | R23,125 | R92,500 |
| **Total Year 1** | **R19,500** | **R114,000** | **R522,000** |

*Note: Ad revenue assumes $3/1000 impressions (eCPM), 5 sessions/month average, 1.5 ads per session*

---

## 19. Audio & Music Strategy

### Sound effects — Pre-generated + bundled

| Sound | Source | File |
|-------|--------|------|
| Correct answer | ElevenLabs SFX or Freesound | correct.mp3 |
| Wrong answer | ElevenLabs SFX or Freesound | wrong.mp3 |
| Timer tick | Synthesised | tick.mp3 |
| Streak 3+ | Synthesised | streak.mp3 |
| Streak 5+ (crowd cheer) | ElevenLabs SFX | crowd-cheer.mp3 |
| Victory fanfare | Purchased/composed | victory.mp3 |
| Happy bark | Freesound (CC0) | bark-happy.mp3 |
| Sad whimper | Freesound (CC0) | bark-sad.mp3 |
| Screen transition | Synthesised | whoosh.mp3 |
| Achievement unlock | Synthesised | achievement.mp3 |
| Button tap | Synthesised | tap.mp3 |
| Countdown beep | Synthesised | countdown.mp3 |

### Background music — Royalty-free licensed

| Track | Use case | Source |
|-------|----------|--------|
| Menu theme | Title screen, settings | Pixabay Music (free) or Epidemic Sound ($15/mo) |
| Easy game | Casual gameplay | Same |
| Intense game | Timer running low, hard questions | Same |
| Victory | Post-game winner screen | Same |
| Daily challenge | Special daily mode | Same |

**License consideration:** Pixabay Music offers royalty-free tracks with a license that allows use in mobile apps including commercial apps. Epidemic Sound ($15/month) provides higher quality and a wider selection. For launch, use Pixabay to keep costs at zero.

### TTS for question reading (optional feature)

**Pre-generate all question audio using Google Cloud TTS WaveNet (free tier: 4 million characters/month).** Store as MP3 files in Cloudflare R2. Download on demand — user enables "read questions aloud" in settings, app downloads the audio pack (~50MB for 2,000 questions at 64kbps).

**Cost: $0** — Google's free tier covers the full generation, R2 storage is free up to 10GB.

---

## 20. Cloudflare Infrastructure Setup

### Step-by-step setup

```bash
# 1. Install Wrangler CLI
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Create D1 database
wrangler d1 create frenchie-trivia-db
# Copy the database_id into wrangler.toml

# 4. Apply schema
wrangler d1 execute frenchie-trivia-db --file=./workers/src/db/schema.sql

# 5. Seed questions
wrangler d1 execute frenchie-trivia-db --file=./workers/src/db/seed.sql

# 6. Create KV namespace
wrangler kv namespace create CACHE
# Copy the id into wrangler.toml

# 7. Create R2 bucket for audio
wrangler r2 bucket create frenchie-trivia-audio

# 8. Set secrets
wrangler secret put JWT_SECRET
wrangler secret put UPSTASH_REDIS_REST_URL
wrangler secret put UPSTASH_REDIS_REST_TOKEN
wrangler secret put FIREBASE_PROJECT_ID

# 9. Deploy
wrangler deploy

# 10. Custom domain (optional)
# In Cloudflare dashboard: Workers & Pages > your worker > Custom Domains
# Add: api.frenchietrivia.com
```

### Free tier budget monitoring

Set up Cloudflare notifications for:
- Workers: Alert at 80,000 requests/day (80% of 100K limit)
- KV: Alert at 80,000 reads/day
- D1: Alert at 4M rows read/day

When approaching limits, upgrade to the $5/month Workers Paid plan.

---

## 21. iOS Development Without a Mac

### Complete workflow from Windows

| Step | Tool | Where it runs |
|------|------|--------------|
| **Write code** | VSCode + Claude Code | Windows |
| **Preview on iPhone** | Expo Go app | iPhone (same WiFi) |
| **Preview on Android** | Android Emulator or Expo Go | Windows / Android phone |
| **Build iOS .ipa** | EAS Build | Cloud (Apple silicon) |
| **Build Android .apk/.aab** | EAS Build (or local) | Cloud or Windows |
| **Submit to App Store** | EAS Submit | Cloud |
| **Submit to Play Store** | EAS Submit or Play Console web | Cloud or browser |
| **OTA JS updates** | EAS Update | Cloud |

### Daily development loop

```bash
# Terminal 1: Start Expo dev server
npx expo start

# → Scan QR code with iPhone camera → opens in Expo Go
# → Hot reload updates instantly as you save files

# Terminal 2: Start Workers dev server (for API)
cd workers && wrangler dev

# Test API calls from the app pointing to local server
# (use ngrok or Expo's tunnel mode if needed)
```

### When you need a "real" iOS build (not Expo Go)

Some features require a development build (e.g., if using native modules not in Expo Go):

```bash
# Create development build in the cloud
eas build --platform ios --profile development

# Download .ipa and install via Expo's internal distribution
# (sends a link to your iPhone — tap to install)
```

---

## 22. App Store Requirements Checklist

### Apple App Store

- [ ] Apple Developer Account ($99/year, R1,832/year)
- [ ] App icon: 1024×1024, no alpha, no rounded corners
- [ ] Screenshots: 6.7" (iPhone 15 Pro Max), 6.1" (iPhone 15), optional iPad
- [ ] Privacy policy URL (hosted publicly)
- [ ] App category: Games > Trivia
- [ ] Age rating: 4+ (no objectionable content)
- [ ] `ITSAppUsesNonExemptEncryption: NO` in Info.plist (uses HTTPS only)
- [ ] App Tracking Transparency if using IDFA (required for AdMob)
- [ ] Apple Sign-In implemented (required if offering any social sign-in)
- [ ] In-app purchases configured in App Store Connect
- [ ] Review guidelines 4.2.2: app must be "useful, unique, and provide some lasting value"

### Google Play Store

- [ ] Google Play Developer Account ($25 one-time, R463)
- [ ] App icon: 512×512 for Play Store listing
- [ ] Feature graphic: 1024×500
- [ ] Screenshots: phone (required), 7" tablet, 10" tablet (optional)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire completed
- [ ] Target audience and content declaration
- [ ] Data safety section completed
- [ ] **20 testers for 14 consecutive days** (new developer account requirement)
- [ ] Signed AAB (Android App Bundle)

---

## 23. Testing Strategy

### Manual testing

| Device | Method |
|--------|--------|
| iPhone 15 Pro Max | Expo Go (development), TestFlight (production) |
| Android phone | Expo Go or direct APK install |
| Android emulator | Android Studio on Windows |
| Web browser | Expo web export in Chrome/Safari |

### Automated testing (stretch goal)

| Layer | Tool | What to test |
|-------|------|--------------|
| Unit tests | Jest | Scoring logic, question selection, achievement checks |
| Component tests | React Native Testing Library | UI components render correctly |
| API tests | Vitest + Workers test framework | All API endpoints, auth flow |
| E2E tests | Detox (future) | Full game flow on simulator |

### Pre-release checklist

- [ ] Play through 10 full games on iPhone
- [ ] Verify all 15 categories have questions
- [ ] Verify difficulty distribution works
- [ ] Test offline mode (airplane mode)
- [ ] Test guest → registered account upgrade
- [ ] Test leaderboard updates after game
- [ ] Test achievement unlocking
- [ ] Test ad display and IAP flow
- [ ] Test share card generation
- [ ] Test deep link opening
- [ ] Verify no memory leaks during long play sessions
- [ ] Verify audio doesn't conflict with phone ringer/silent mode

---

## 24. Marketing & Launch Plan

### Pre-launch (2 weeks before)

1. **Landing page:** frenchietrivia.com with email signup + countdown
2. **Instagram:** Create @frenchietrivia account, post daily Frenchie trivia facts
3. **TikTok:** Create @frenchietrivia, post "Did you know?" Frenchie fact videos
4. **Reddit:** Engage in r/FrenchBulldogs, r/Frenchbulldogs (don't spam)
5. **Facebook:** Join 5 large Frenchie owner groups, build presence

### Launch week

1. Post in **all** Frenchie Facebook groups (500K+ members across groups)
2. DM 10–20 Frenchie Instagram accounts with 10K+ followers, offer free premium for review
3. Post on TikTok with "Test your Frenchie knowledge" hook
4. Submit to **Product Hunt** (Pets category)
5. Post on r/FrenchBulldogs and r/indiegaming

### Ongoing marketing (zero budget)

- **Daily trivia fact** posted to Instagram Stories + TikTok
- **Weekly "Question of the Week"** poll on Instagram
- **User-generated content:** Encourage players to share score cards
- **ASO (App Store Optimisation):** Monitor keyword rankings, iterate on title/description
- **Respond to every review** on both app stores

### Marketing channels ranked by expected ROI

| Channel | Cost | Expected downloads/month | Notes |
|---------|------|------------------------|-------|
| TikTok organic | R0 | 500–5,000 | Frenchie content goes viral easily |
| Instagram Reels | R0 | 200–2,000 | Cross-post TikTok content |
| Facebook groups | R0 | 100–1,000 | Direct access to Frenchie owners |
| App Store search (ASO) | R0 | 50–500 | "French Bulldog quiz" has no competition |
| Frenchie influencer gifting | R0 (free premium) | 100–2,000 per influencer | High conversion from trusted source |

---

## 25. Cost Projections (ZAR)

Exchange rate: R18.50 per USD

### Startup costs (one-time or first year)

| Item | USD | ZAR |
|------|-----|-----|
| Apple Developer Program | $99/yr | R1,832 |
| Google Play Developer | $25 (one-time) | R463 |
| Domain: frenchietrivia.com | ~$12/yr | R222 |
| TTS audio generation | $0 (Google free tier) | R0 |
| Royalty-free music | $0 (Pixabay) | R0 |
| Sound effects | $0 (Freesound CC0) | R0 |
| Expo EAS Build | $0 (free tier) | R0 |
| Cloudflare | $0 (free tier) | R0 |
| **Total startup** | **$136** | **R2,517** |

### Monthly operating costs at scale

| Cost item | 1K MAU | 10K MAU | 100K MAU | 1M MAU |
|-----------|--------|---------|----------|--------|
| Cloudflare Workers Paid | R0 | R93 | R962 | R12,395 |
| Upstash Redis | R0 | R0 | R185 | R370 |
| Firebase Auth | R0 | R0 | R0 | R5,088 |
| Sentry (error tracking) | R0 | R0 | R0 | R481 |
| PostHog (analytics) | R0 | R0 | R0 | R1,665 |
| Apple annual fee (monthly) | R153 | R153 | R153 | R153 |
| Domain renewal (monthly) | R19 | R19 | R19 | R19 |
| **Total monthly** | **R172** | **R265** | **R1,319** | **R20,171** |
| **Total annual** | **R2,064** | **R3,180** | **R15,828** | **R242,052** |

### Break-even analysis

With the freemium model (ads + IAP):

| Metric | Value |
|--------|-------|
| Estimated revenue per MAU per month | ~R4–R6 (ads + IAP combined) |
| Monthly costs at 1K MAU | R172 |
| **Break-even MAU** | **~35–45 users** |
| Annual fixed costs | ~R2,500 |
| **Break-even annual downloads (paid $2.99)** | **~53 downloads** |

---

## 26. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Apple rejects app | Medium | High | Follow guidelines strictly, no deceptive practices, proper privacy policy |
| Google Play 20-tester delay | High | Medium | Start tester recruitment immediately, use friends/family/Frenchie community |
| Low download numbers | Medium | Medium | Double down on TikTok/Instagram marketing, ASO optimisation |
| Cloudflare free tier exceeded | Low (at launch) | Low | Monitor usage, upgrade to $5 plan when needed |
| Question content errors | Medium | Low | Community reporting, regular review cycles |
| Negative reviews | Medium | Low | Respond to all reviews, fix issues quickly via OTA updates |
| ElevenLabs changes pricing | Low | Low | Pre-generate all audio, no runtime dependency |
| Expo breaking changes | Low | Medium | Pin SDK version, update incrementally |
| Copyright issues with images | Low | High | Use only licensed/original Frenchie illustrations, no photos without rights |
| Copycat apps appear | Medium | Low | First-mover advantage, community building, regular content updates |

---

## 27. Success Metrics & KPIs

### Launch month targets (Month 1)

| Metric | Target |
|--------|--------|
| Total downloads | 1,000+ |
| Monthly active users | 500+ |
| Average session length | 5+ minutes |
| Day 1 retention | 40%+ |
| Day 7 retention | 20%+ |
| App store rating | 4.5+ stars |
| Crash-free rate | 99%+ |

### Year 1 targets

| Metric | Pessimistic | Realistic | Optimistic |
|--------|------------|-----------|------------|
| Total downloads | 5,000 | 25,000 | 100,000 |
| Monthly active users | 1,500 | 7,500 | 30,000 |
| Annual revenue | R19,500 | R114,000 | R522,000 |
| Question bank size | 2,500 | 3,000 | 5,000 |
| App store rating | 4.0 | 4.5 | 4.7 |

### Key metrics to track (PostHog)

- Daily/Weekly/Monthly active users
- Games played per user per day
- Session length
- Most/least popular categories
- Question difficulty accuracy rates
- Funnel: download → first game → 2nd game → registered → premium
- Ad revenue per user
- IAP conversion rate
- Leaderboard participation rate

---

## 28. File-by-File Implementation Checklist

This is the master task list for building the app. Work through each phase sequentially.

### Phase 1 — Foundation

- [ ] `package.json` — Expo + all dependencies
- [ ] `app.json` — Expo config with iOS/Android settings
- [ ] `eas.json` — EAS Build profiles
- [ ] `tsconfig.json` — TypeScript configuration
- [ ] `tailwind.config.js` — NativeWind config
- [ ] `.env.example` — Environment variable template
- [ ] `.gitignore` — Node, Expo, OS ignores
- [ ] `app/_layout.tsx` — Root layout with providers
- [ ] `app/(tabs)/_layout.tsx` — Tab navigation layout
- [ ] `app/(tabs)/home.tsx` — Home screen (basic)
- [ ] `app/game/setup.tsx` — Game setup (basic)
- [ ] `app/game/play.tsx` — Game screen (basic)
- [ ] `app/game/results.tsx` — Results screen (basic)
- [ ] `workers/src/index.ts` — Hono app with health endpoint
- [ ] `workers/src/db/schema.sql` — Full D1 schema
- [ ] `workers/wrangler.toml` — Workers config
- [ ] `lib/types/question.ts` — Question types
- [ ] `lib/types/user.ts` — User types
- [ ] `lib/types/game.ts` — Game state types

### Phase 2 — Core Game

- [ ] `lib/game/engine.ts` — Game state machine
- [ ] `lib/game/scoring.ts` — Score calculation
- [ ] `lib/game/difficulty.ts` — Question difficulty distribution
- [ ] `lib/game/streaks.ts` — Streak tracking
- [ ] `lib/stores/gameStore.ts` — Zustand game state
- [ ] `lib/stores/settingsStore.ts` — Settings store
- [ ] `lib/api/client.ts` — API client with auth headers
- [ ] `lib/api/questions.ts` — Question fetching + caching
- [ ] `components/game/AnswerButton.tsx` — Answer button with animations
- [ ] `components/game/AnswerGrid.tsx` — 2x2 answer layout
- [ ] `components/game/TimerBar.tsx` — Animated countdown
- [ ] `components/game/QuestionCard.tsx` — Question display
- [ ] `components/game/ScoreHUD.tsx` — Score/streak/round HUD
- [ ] `components/game/DifficultyBadge.tsx` — Difficulty indicator
- [ ] `components/game/FeedbackOverlay.tsx` — Correct/wrong overlay
- [ ] `components/game/StreakCelebration.tsx` — Streak animation
- [ ] `components/game/ConfettiExplosion.tsx` — Winner confetti
- [ ] `components/game/CountdownOverlay.tsx` — 3-2-1 countdown
- [ ] `workers/src/routes/questions.ts` — Question API endpoints
- [ ] `workers/src/db/seed.sql` — 500+ questions seeded
- [ ] `scripts/seed-questions.ts` — Question import script
- [ ] `scripts/validate-questions.ts` — Question linter

### Phase 3 — Users & Leaderboard

- [ ] `lib/stores/authStore.ts` — Auth state
- [ ] `lib/api/auth.ts` — Auth API calls
- [ ] `lib/api/leaderboard.ts` — Leaderboard API
- [ ] `lib/api/scores.ts` — Score submission
- [ ] `app/(auth)/_layout.tsx` — Auth layout
- [ ] `app/(auth)/login.tsx` — Login screen
- [ ] `app/(auth)/register.tsx` — Register screen
- [ ] `app/(tabs)/leaderboard.tsx` — Leaderboard screen
- [ ] `app/(tabs)/profile.tsx` — User profile
- [ ] `components/leaderboard/RankingRow.tsx` — Leaderboard row
- [ ] `components/leaderboard/TopThreePodium.tsx` — Top 3 display
- [ ] `components/ui/Avatar.tsx` — Frenchie avatar component
- [ ] `components/ui/ProgressBar.tsx` — XP progress bar
- [ ] `workers/src/routes/auth.ts` — Auth endpoints
- [ ] `workers/src/routes/profile.ts` — Profile endpoints
- [ ] `workers/src/routes/leaderboard.ts` — Leaderboard endpoints
- [ ] `workers/src/routes/scores.ts` — Score endpoints
- [ ] `workers/src/middleware/auth.ts` — JWT verification
- [ ] `workers/src/middleware/rateLimit.ts` — Rate limiting
- [ ] `workers/src/services/leaderboard.ts` — Redis leaderboard logic

### Phase 4 — Audio, Polish & Monetisation

- [ ] `lib/audio/SoundManager.ts` — SFX playback
- [ ] `lib/audio/MusicEngine.ts` — Background music
- [ ] `lib/audio/sounds.ts` — Sound asset references
- [ ] `lib/game/achievements.ts` — Achievement checking
- [ ] `lib/api/achievements.ts` — Achievement API
- [ ] `lib/utils/share.ts` — Social sharing
- [ ] `lib/utils/haptics.ts` — Haptic wrapper
- [ ] `app/(tabs)/achievements.tsx` — Achievement gallery
- [ ] `app/store.tsx` — IAP store screen
- [ ] `app/settings.tsx` — Settings screen
- [ ] `components/achievements/AchievementCard.tsx` — Achievement card
- [ ] `components/achievements/AchievementToast.tsx` — Unlock toast
- [ ] `components/ui/ShareCard.tsx` — Shareable result image
- [ ] `workers/src/routes/achievements.ts` — Achievement endpoints
- [ ] All sound effect files in `assets/audio/sfx/`
- [ ] All music files in `assets/audio/music/`
- [ ] AdMob integration (interstitial + rewarded + banner)
- [ ] RevenueCat integration (IAP)

### Phase 5 — App Store Submission

- [ ] `assets/images/icon.png` — 1024x1024 app icon
- [ ] `assets/images/splash.png` — Splash screen
- [ ] `assets/images/adaptive-icon.png` — Android adaptive icon
- [ ] App Store screenshots (6.7" + 6.1")
- [ ] Google Play screenshots + feature graphic
- [ ] Privacy policy page (hosted)
- [ ] Terms of service page (hosted)
- [ ] App Store description and keywords
- [ ] Google Play listing content
- [ ] Production build (iOS)
- [ ] Production build (Android)
- [ ] TestFlight beta test
- [ ] Google Play internal test
- [ ] Final submission to both stores

---

## Quick reference commands

```bash
# Start development
npx expo start                      # Start Expo dev server
cd workers && wrangler dev           # Start API locally

# Build
eas build --platform ios             # Cloud iOS build
eas build --platform android         # Cloud Android build

# Deploy
cd workers && wrangler deploy        # Deploy API to Cloudflare
eas update                           # OTA JavaScript update (no store review)

# Submit
eas submit --platform ios            # Submit to App Store
eas submit --platform android        # Submit to Google Play

# Database
wrangler d1 execute frenchie-trivia-db --command="SELECT COUNT(*) FROM questions"
wrangler d1 execute frenchie-trivia-db --file=./workers/src/db/seed.sql
```

---

*This document is the single source of truth for building Frenchie Trivia. Update it as decisions change and phases complete. When ready to move to its own repository, copy this entire `feature/frenchie-trivia-app` branch.*
