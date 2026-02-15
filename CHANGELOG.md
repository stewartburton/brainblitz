# Changelog

## [2.0.0] - 2026-02-15

### Bug Fixes
- **Countdown beeps**: Fixed countdown sound logic that never triggered — now correctly beeps at 3, 2, 1 seconds using `prevTimeLeft` comparison
- **Fetch timeout**: Added `AbortSignal.timeout(8000)` to all API fetches with polyfill for older webOS browsers
- **Error handling**: Replaced `alert()` with in-app error screen ("Haibo!") with retry and home buttons
- **TV font sizes**: Increased HUD labels, category badge, and stat labels for 10-foot TV viewing distance
- **Double-click prevention**: Added `gameLoading` guard to prevent multiple game starts

### New Features
- **Winner celebration**: Confetti animation, bouncing trophy icon, gold gradient on winner's score, dimmed loser column
- **Enhanced answer feedback**: Pulse+glow animation on correct answers, shake animation on wrong answers, dimmed non-selected answers
- **Active turn indicator**: Pulsing glow border around current player's HUD section (cyan for Burden, pink for Stu)
- **New sound effects**: `sfxClick` (UI buttons), `sfxWhoosh` (screen transitions), `sfxVictory` (winner fanfare), `sfxDraw` (draw sound)
- **Arrow key navigation**: Full LG Magic Remote / arrow key support for 2x2 answer grid and all menu screens
- **LG Back button**: keyCode 461 / Escape navigates back to previous screen
- **Leaderboard screen**: "Puntestand" screen showing lifetime stats for both players (wins, games, draws, total score, best game, best streak)
- **Score persistence**: Cloudflare KV integration via Pages Functions — stats persist across sessions
- **Title screen wins**: Lifetime win counts displayed on the title screen (loads from KV)
- **ElevenLabs TTS**: Optional voice toggle in settings — questions read aloud before timer starts via ElevenLabs API proxy
- **Error screen**: Dedicated error screen with "Probeer Weer" (retry) and "Huis Toe" (home) buttons

### Infrastructure
- Renamed `brainblitz.html` → `index.html` for Cloudflare Pages root serving
- Added `functions/api/scores.js` — Cloudflare Pages Function for KV read/write
- Added `functions/api/_middleware.js` — CORS middleware for API routes
- Added `functions/api/tts.js` — ElevenLabs TTS proxy (keeps API key secret)
