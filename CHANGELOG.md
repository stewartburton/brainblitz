# Changelog

## [5.0.0] - 2026-02-16

### New Features
- **ElevenLabs Music integration**: Replace synthesized music with AI-generated tracks via ElevenLabs Music API. 4 tracks: title (60s chill lo-fi), game (60s energetic electronic), victory (30s triumphant), draw (30s ambient). Cached in Cloudflare KV.
- **ElevenLabs Sound Effects**: Replace synthesized SFX with AI-generated sound effects via ElevenLabs SFX API. 12 effects: correct, wrong, tick, countdown, start, click, whoosh, victory fanfare, draw tone, crowd cheer, achievement, streak fire. Cached in KV.
- **Graceful fallback**: All ElevenLabs audio falls back to existing Web Audio API synthesis when cached assets are unavailable. Game always works without generated audio.
- **Admin audio panel**: New "Audio Assets" section in admin panel shows generation status for all music tracks and SFX, with individual "Generate" buttons and "Generate All" for batch generation.
- **Admin cost dashboard**: Comprehensive ElevenLabs cost breakdown showing TTS, Music, and SFX usage with estimated costs in ZAR. Shows Creator plan quota usage (31 min music, 2,500s SFX).
- **Auto-loading**: Cached audio assets load automatically on page start (non-blocking). New assets available immediately after generation without page reload.
- **Local audio assets**: Generated music and SFX saved to `assets/music/` and `assets/sfx/` as MP3 files for backup.

### Infrastructure
- Added `functions/api/music.js` — generate + cache music tracks via ElevenLabs Music API (`music_v1` model, instrumental, mp3_44100_128)
- Added `functions/api/sfx.js` — generate + cache sound effects via ElevenLabs SFX API (`eleven_text_to_sound_v2` model, mp3_44100_128)
- KV keys: `music:{name}`, `music:meta:{name}`, `sfx:{name}`, `sfx:meta:{name}`

## [4.0.0] - 2026-02-15

### New Features
- **Difficulty scaling**: Questions tagged easy/medium/hard with difficulty stars in HUD. Harder questions earn 1.5x–2x base points
- **Answer cascade**: Wrong answers grey out one-by-one with staggered animation before revealing the correct answer
- **Achievements system**: 15 achievements (e.g. Perfect Game, Speed Demon, Comeback King) tracked per player, stored in Cloudflare KV, with toast notifications and gallery screen
- **Streak celebration**: 5+ correct streak triggers rainbow border glow, "ON FIRE" overlay, and crowd cheer SFX
- **Close game tension**: When scores are within 15%, background shifts to dramatic tint, scores pulse, and music volume rises
- **Screen transitions**: Smooth scale + fade transitions between all screens
- **Admin panel**: PIN-locked (4-digit code) admin settings with ElevenLabs TTS usage/cost summary and language toggle
- **Language system**: Switch between South African English and Afrikaans — all UI labels, feedback expressions, winner text, leaderboard stats translate instantly
- **New categories**: Braai Culture (30 Qs), 90s Pop Culture (31 Qs), SA Food & Slang (30 Qs), True or False (20 Qs)
- **Expanded question bank**: 10 additional questions per existing category (Frenchies, Hiking, SA Wines, Paris, Cheeses) — all with difficulty ratings

### Performance
- **CSS-driven timer**: Replaced `setInterval(50ms)` visual timer with CSS `animation: timerShrink` + `will-change: transform` for GPU-accelerated rendering
- **requestAnimationFrame timer**: Countdown logic uses rAF loop instead of setInterval — eliminates lag and drift on LG webOS

### Bug Fixes
- **webOS compatibility**: Replaced all optional chaining (`?.`) and spread syntax (`[...]`) with ES5-compatible alternatives
- **Removed steal mechanic**: Cleaned out unused steal overlay, CSS, JS, and state variables

### Infrastructure
- Added `functions/api/achievements.js` — GET/POST player achievements via KV
- All new questions include difficulty ratings (1/2/3)

## [3.0.0] - 2026-02-15

### Major Improvements
- **Faster game pace**: Reduced answer feedback delay (1800ms → 1200ms), turn switch countdown (800ms → 600ms per tick), and round splash (1200ms → 800ms) — total between-question time cut by ~40%
- **Faster TTS**: Switched ElevenLabs model from `eleven_multilingual_v2` to `eleven_turbo_v2_5` for faster voice generation, reduced timeout from 10s to 6s
- **Score pop animation**: HUD scores flash and scale when points are added
- **Timer danger pulse**: Timer bar throbs when below 30% remaining
- **Particle burst on correct answer**: Green/cyan/yellow particle explosion from the answer button
- **Leaderboard counter animation**: Stats count up from 0 when entering leaderboard
- **Settings pill animation**: Selected pills scale up slightly for tactile feedback
- **Settings persistence**: Selected settings (category, timer, rounds, voice) saved to localStorage and restored on page load
- **Score number formatting**: Scores above 999 display with comma separators (e.g. 1,200)
- **TTS loading indicator**: Speaker icon pulses while waiting for voice to load
- **TTS usage tracking**: Character count and request history stored in KV (`tts:usage` key), accessible via `GET /api/tts-usage`

### Bug Fixes
- **Turn switch interval leak**: Stored interval reference so it can be cleaned up if navigation happens during countdown
- **Dead code**: Removed unused `prevPlayer` variable in selectAnswer and timeUp
- **Question pool warning**: If a category has fewer questions than selected rounds, rounds auto-adjust instead of silently playing fewer
- **Loser column readability**: Increased loser opacity from 0.45 to 0.55 for better TV viewing

### Question Bank Fixes
- Replaced Eiffel Tower height question with Moulin Rouge question (was 3 Eiffel Tower Qs, now 2)
- Replaced 3 Frenchie health questions with personality/fun fact questions (sleeping position, sounds, attitude to strangers)
- Fixed obviously wrong answer options (lifespan "3-4 years" → "13-15 years", litter size "1" → "1-2")
- Fixed debatable "most consumed cheese" → "most popular pizza topping" (Mozzarella)

### Infrastructure
- Added `functions/api/tts-usage.js` — GET endpoint for TTS character usage stats
- Switched TTS model to `eleven_turbo_v2_5` for faster response

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
