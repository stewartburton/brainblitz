# BrainBlitz LG TV Improvements — Design Document

**Date:** 2026-03-01
**Status:** Approved

## Summary

Three major improvement areas for the BrainBlitz TV trivia game:
1. Turn switch redesign ("Spotlight Handoff") + dynamic player names
2. LG TV visual polish, remote UX, and webOS performance
3. Cape Town trivia expansion (~200+ new questions)

---

## 1. Dynamic Player Names & Persistence

### Problem
Players are hardcoded as "Burden" and "Stu". Anyone else playing has to pretend to be them.

### Design

**Name Entry Screen** (new screen, shown before Settings):
- Two large input fields side by side: "Player 1" (cyan) and "Player 2" (magenta)
- Pre-filled with last-used names from localStorage
- LG Magic Remote clicks into field, webOS shows on-screen keyboard
- D-pad: left/right between fields, down to "Continue" button
- 12-character limit (fits HUD on TV)
- Default placeholder: "Player 1" / "Player 2" if left blank

**KV Storage Redesign:**
- `players:index` — JSON array of all known player names
- `player:{normalized_name}` — stats object (wins, gamesPlayed, draws, totalScore, totalCorrect, bestGameScore, bestStreak, lastPlayed)
- Normalized = lowercase, trimmed
- Achievements: `achievements:{normalized_name}`
- Leaderboard: head-to-head view between current two players (not global ranking)

**Migration:** One-time function moves `stats:burden` → `player:burden`, `stats:stu` → `player:stu`, and equivalent for achievements. Runs on first load, checks for `migration:v2` key.

**Code Impact:**
- Replace all hardcoded "Burden"/"Stu" references with `players[0].name` / `players[1].name`
- Update `functions/api/scores.js` to handle dynamic player keys
- Update `functions/api/achievements.js` similarly
- New screen in `showScreen()` flow: `name-entry` between title and settings

---

## 2. Turn Switch — "Spotlight Handoff"

### Problem
Current 2-second countdown ("3... 2... 1...") is sluggish and kills momentum.

### Design

**Visual:** Full-screen wipe in the next player's theme color (cyan/magenta). Player name slides in with scale-up animation. "PASS THE REMOTE" pulses below in smaller text.

**Timing:** ~1.2 seconds total. Auto-dismisses into the question.

**Audio:** Quick whoosh SFX on transition.

**Round splashes:** Reduced frequency — only on question 1, 6, 11, 16 (every 5 questions) instead of every question.

**Active player indicator:** During gameplay, active player's HUD panel gets a glowing border in their color. Inactive player's panel dims to opacity 0.6.

**Code Impact:**
- Replace `showTurnSwitch()` with `spotlightHandoff()`
- New CSS animations: wipe-in, scale-up, pulse
- Modify `showRoundSplash()` to only trigger on milestone questions
- Add active/inactive CSS classes to player HUD panels

---

## 3. LG TV Visual Polish

### Big-Screen Readability
- Question text: `clamp(2rem, 3.5vw, 3rem)` (up from `clamp(1.6rem, 3vw, 2.4rem)`)
- Answer button text: proportionally larger
- HUD scores/names: larger and bolder
- Difficulty badges: higher contrast colors

### Focus States
- All focusable elements: 4px glowing border (neon cyan/magenta)
- Focused buttons: `scale(1.05)` transform — visible pop from 3m away
- Answer buttons: animated pulsing glow on focus
- Menu buttons: same glow treatment

### Active Player Emphasis
- Active player score panel: bright border glow + slight scale-up
- Inactive player panel: dims to opacity 0.6
- Unmistakable visual separation

### Bigger Animations
- Correct answer: more particles, larger burst radius
- Streak fire: bigger "ON FIRE!" overlay
- Victory confetti: increased count and spread

---

## 4. Remote-Friendly Controls & Performance

### Magic Remote
- Answer buttons: minimum height 80px
- All clickable elements: minimum 64x64px target
- Hover states: glow on pointer hover

### D-pad Navigation
- Visible focus indicator that animates between buttons (smooth transition, not snap)
- Wrap-around navigation (right on B wraps to A)
- Menu screens: consistent top-to-bottom flow, first item auto-focused

### Input Debouncing
- After answer selected: disable all inputs for 300ms
- Turn switch screen: prevent accidental double-taps
- Back button: debounce to prevent double-navigation

### webOS Performance
- Reduce simultaneous CSS animation count during gameplay
- Lazy-load ElevenLabs audio assets (only on game start, not app load)
- Add `will-change` hints on frequently animated elements (timer bar, scores)
- Minimize DOM reflows during question transitions

---

## 5. Cape Town Trivia Expansion

### New Categories (4)

**Cape Town Coffee & Cafes** (~40-50 questions)
Focus: specialty coffee scene, roasters, cafe culture, neighborhoods
Topics: Truth Coffee, Origin, Rosetta, Deluxe, Tribe, Bootlegger, Espresso Lab, latte art, pour-over culture, Woodstock/CBD/Kloof St cafe strips

**Cape Winelands** (~40-50 questions)
Focus: wine route experiences, estates, terroir, food pairings
Topics: Franschhoek, Stellenbosch, Constantia, Hemel-en-Aarde, Chocolate Block, Meerlust, Kanonkop, pinotage origins, MCC sparkling, wine tram, harvest festivals

**Cape Town Foodie** (~40-50 questions)
Focus: restaurant scene, street food, markets, food culture
Topics: The Test Kitchen, La Colombe, Harbour House, Old Biscuit Mill, Neighbourgoods Market, gatsby sandwiches, Cape Malay curry, bobotie, koeksisters, biltong, Hout Bay fish & chips, District Six culinary heritage

**Cape Adventures** (~40-50 questions)
Focus: outdoor activities, adrenaline, natural wonders
Topics: Table Mountain routes (Platteklip, India Venster, Skeleton Gorge), Lion's Head sunrise, shark cage diving, Muizenberg surfing, Chapman's Peak, Cape Point, Kirstenbosch, paragliding, bouldering, coasteering, Two Oceans Aquarium, penguin colony at Boulders Beach

### Additions to Existing Categories
- **Hiking:** 10-15 Cape Town hiking questions
- **SA Wines:** Constantia/Stellenbosch-specific additions
- **SA Food & Slang:** Cape Malay cuisine, Cape slang
- **True or False:** Cape Town myth-busting facts

### Volume
- ~200+ new questions total (roughly doubling the bank)
- Difficulty distribution: 40% easy, 35% medium, 25% hard per category

---

## Out of Scope
- Global multi-player leaderboard (keeping head-to-head only)
- Online multiplayer
- Additional language support beyond English/Afrikaans
- Changes to scoring formula or achievement system mechanics
