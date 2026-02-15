# Changelog

## [2.3.0] - 2026-02-15

### Bug Fixes
- **Audio crackle**: Added master dynamics compressor to prevent clipping — all audio (SFX + music) routes through compressor. Added periodic cleanup of ended Web Audio nodes and array cap to prevent memory buildup
- **webOS CSS**: Replaced all remaining `inset: 0` (4 instances in bg-grid, bg-glow, feedback-overlay, confetti-container) with explicit `top/left/right/bottom` for older webOS browsers
- **Button overlap on results**: Increased gap between "Play Again!" and "Home" buttons (30px → 50px) and reduced button padding to prevent neon glow overlap
- **sfxCorrect too loud**: Reduced from 0.15 to 0.10 gain to not overpower the music
- **Stale leaderboard**: Stats now refresh when navigating to leaderboard or title screen (not just on page load)

### New Features
- **First question countdown**: "Get Ready" turn switch overlay now shows before the very first question too
- **Kick volume balanced**: Reduced kick gain from 0.25 to 0.20 to sit better in the mix

## [2.2.0] - 2026-02-15

### New Features
- **Turn switch countdown**: 3-2-1 countdown overlay between player turns showing next player's name in their color — gives players time to swap and get ready
- **Voice selection**: Choose between Rachel and Butcher voices in settings (was On/Off)

### Bug Fixes
- **Loser score hidden**: Fixed purple block covering loser's score on results screen — added missing `-webkit-background-clip: text` to Stu's inline gradient style for webOS compatibility
- **Music too quiet**: Increased all music master gain volumes (~2.5x louder)
- **TTS too loud**: Reduced voice playback volume to 50%

## [2.1.0] - 2026-02-15

### New Features
- **Step sequencer music engine**: Replaced drone-based music with a proper step sequencer — title screen plays a chill lo-fi theme (82 BPM, Cmaj7→Am7→Fmaj7→G arpeggios), game track builds tension with intensity (115 BPM, Am→Dm→Em), victory is triumphant (135 BPM ascending arpeggios)
- **Music mute toggle**: Speaker button in the corner to mute/unmute background music
- **Voice selection**: Choose between two ElevenLabs voices in settings — Rachel or Butcher (was previously just On/Off)

### Bug Fixes
- **TV alignment**: Fixed `inset: 0` CSS shorthand not supported on older webOS browsers — replaced with explicit `top/left/right/bottom: 0` and `width/height: 100%`

### Infrastructure
- Updated `functions/api/tts.js` to accept `voice_id` parameter with allowlist validation

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
