# BrainBlitz LG TV Improvements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve the LG TV trivia game with dynamic player names, a faster turn switch, better TV UX, and ~200+ Cape Town trivia questions.

**Architecture:** Single HTML file (`index.html`) with inline CSS/JS. Cloudflare Pages Functions in `functions/api/` for KV persistence. All changes must be webOS-compatible (no `?.`, `??`, spread syntax, or `inset: 0`).

**Tech Stack:** Vanilla HTML/CSS/JS, Cloudflare Workers KV, ElevenLabs APIs

**Design Doc:** `docs/plans/2026-03-01-lg-tv-improvements-design.md`

---

## webOS Compatibility Checklist (apply to ALL code)

Before every commit, verify:
- NO optional chaining (`?.`) — use `&&` chains or explicit checks
- NO nullish coalescing (`??`) — use `||` or ternary
- NO spread syntax (`[...arr]`) — use `[].slice.call(arr)` or `.concat()`
- NO `inset: 0` CSS — use explicit `top:0; left:0; right:0; bottom:0`
- Use `var` for function-scoped declarations where `let`/`const` might cause issues on oldest webOS
- Use `indexOf` instead of `includes` for arrays

---

### Task 1: Update Scores API for Dynamic Player Names

**Files:**
- Modify: `functions/api/scores.js`

**Step 1: Rewrite `onRequestGet` to accept player name query params**

Replace the entire `onRequestGet` function. Instead of hardcoded `stats:burden`/`stats:stu`, accept `?p1=name1&p2=name2` query params and look up `player:{normalized}` keys.

```javascript
export async function onRequestGet(context) {
  var env = context.env;
  var url = new URL(context.request.url);
  var p1 = url.searchParams.get('p1');
  var p2 = url.searchParams.get('p2');

  try {
    // Migration check: if old keys exist and new don't, migrate
    var migrated = await env.BRAINBLITZ_KV.get('migration:v2', 'text');
    if (!migrated) {
      var oldBurden = await env.BRAINBLITZ_KV.get('stats:burden', 'json');
      var oldStu = await env.BRAINBLITZ_KV.get('stats:stu', 'json');
      if (oldBurden) {
        await env.BRAINBLITZ_KV.put('player:burden', JSON.stringify(oldBurden));
      }
      if (oldStu) {
        await env.BRAINBLITZ_KV.put('player:stu', JSON.stringify(oldStu));
      }
      // Migrate achievements too
      var oldBAch = await env.BRAINBLITZ_KV.get('achievements:burden', 'json');
      var oldSAch = await env.BRAINBLITZ_KV.get('achievements:stu', 'json');
      if (oldBAch) {
        await env.BRAINBLITZ_KV.put('achievements:player:burden', JSON.stringify(oldBAch));
      }
      if (oldSAch) {
        await env.BRAINBLITZ_KV.put('achievements:player:stu', JSON.stringify(oldSAch));
      }
      await env.BRAINBLITZ_KV.put('migration:v2', 'done');
    }

    if (p1 && p2) {
      var k1 = p1.trim().toLowerCase();
      var k2 = p2.trim().toLowerCase();
      var results = await Promise.all([
        env.BRAINBLITZ_KV.get('player:' + k1, 'json'),
        env.BRAINBLITZ_KV.get('player:' + k2, 'json'),
      ]);
      return new Response(JSON.stringify({
        p1: results[0] || null,
        p2: results[1] || null,
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Fallback: return old format for backwards compat
    var burden = await env.BRAINBLITZ_KV.get('player:burden', 'json');
    var stu = await env.BRAINBLITZ_KV.get('player:stu', 'json');
    return new Response(JSON.stringify({
      burden: burden || null,
      stu: stu || null,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to load stats' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

**Step 2: Rewrite `onRequestPost` to accept any player name**

Replace the player validation. Instead of `['burden', 'stu'].includes(player)`, normalize the name and use `player:{name}` key.

```javascript
export async function onRequestPost(context) {
  var request = context.request;
  var env = context.env;

  try {
    var body = await request.json();
    var player = body.player;
    var won = body.won;
    var draw = body.draw;
    var score = body.score;
    var correct = body.correct;
    var bestStreak = body.bestStreak;

    if (!player || typeof player !== 'string' || player.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid player name' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    var normalized = player.trim().toLowerCase();
    var key = 'player:' + normalized;
    var existing = await env.BRAINBLITZ_KV.get(key, 'json') || {
      gamesPlayed: 0, wins: 0, draws: 0,
      totalScore: 0, totalCorrect: 0,
      bestGameScore: 0, bestStreak: 0, lastPlayed: null,
    };

    existing.gamesPlayed += 1;
    if (won) existing.wins += 1;
    if (draw) existing.draws += 1;
    existing.totalScore += score || 0;
    existing.totalCorrect += correct || 0;
    if ((score || 0) > existing.bestGameScore) existing.bestGameScore = score;
    if ((bestStreak || 0) > existing.bestStreak) existing.bestStreak = bestStreak;
    existing.lastPlayed = new Date().toISOString();

    await env.BRAINBLITZ_KV.put(key, JSON.stringify(existing));

    return new Response(JSON.stringify({ ok: true, stats: existing }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to save stats' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

**Step 3: Verify no webOS-incompatible syntax, commit**

```bash
git add functions/api/scores.js
git commit -m "feat: update scores API to support dynamic player names with migration"
```

---

### Task 2: Update Achievements API for Dynamic Player Names

**Files:**
- Modify: `functions/api/achievements.js`

**Step 1: Update `onRequestGet` to accept dynamic player name**

Replace the `['burden', 'stu'].indexOf(player)` check with normalized name lookup. Use `achievements:player:{normalized}` keys.

```javascript
export async function onRequestGet(context) {
  var env = context.env;
  var url = new URL(context.request.url);
  var player = url.searchParams.get('player');
  var p1 = url.searchParams.get('p1');
  var p2 = url.searchParams.get('p2');

  try {
    if (player) {
      var normalized = player.trim().toLowerCase();
      var data = await env.BRAINBLITZ_KV.get('achievements:player:' + normalized, 'json');
      return new Response(JSON.stringify(data || { earned: [], history: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (p1 && p2) {
      var k1 = p1.trim().toLowerCase();
      var k2 = p2.trim().toLowerCase();
      var results = await Promise.all([
        env.BRAINBLITZ_KV.get('achievements:player:' + k1, 'json'),
        env.BRAINBLITZ_KV.get('achievements:player:' + k2, 'json'),
      ]);
      return new Response(JSON.stringify({
        p1: results[0] || { earned: [], history: [] },
        p2: results[1] || { earned: [], history: [] },
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Fallback: old format
    var results = await Promise.all([
      env.BRAINBLITZ_KV.get('achievements:player:burden', 'json'),
      env.BRAINBLITZ_KV.get('achievements:player:stu', 'json'),
    ]);
    return new Response(JSON.stringify({
      burden: results[0] || { earned: [], history: [] },
      stu: results[1] || { earned: [], history: [] },
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to load achievements' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

**Step 2: Update `onRequestPost` similarly**

```javascript
export async function onRequestPost(context) {
  var env = context.env;

  try {
    var body = await context.request.json();
    var player = body.player;
    var newAchievements = body.achievements;

    if (!player || typeof player !== 'string' || player.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid player name' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(newAchievements) || newAchievements.length === 0) {
      return new Response(JSON.stringify({ error: 'No achievements provided' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    var normalized = player.trim().toLowerCase();
    var key = 'achievements:player:' + normalized;
    var existing = await env.BRAINBLITZ_KV.get(key, 'json');
    if (!existing) {
      existing = { earned: [], history: [] };
    }

    var now = new Date().toISOString();
    var added = [];

    for (var i = 0; i < newAchievements.length; i++) {
      var achId = newAchievements[i];
      if (existing.earned.indexOf(achId) === -1) {
        existing.earned.push(achId);
        existing.history.push({ id: achId, timestamp: now });
        added.push(achId);
      }
    }

    if (added.length > 0) {
      await env.BRAINBLITZ_KV.put(key, JSON.stringify(existing));
    }

    return new Response(JSON.stringify({
      ok: true, added: added, achievements: existing,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to save achievements' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

**Step 3: Commit**

```bash
git add functions/api/achievements.js
git commit -m "feat: update achievements API to support dynamic player names"
```

---

### Task 3: Add Name Entry Screen (HTML + CSS)

**Files:**
- Modify: `index.html` (HTML section ~line 1822, CSS section ~line 12-800)

**Step 1: Add CSS for name entry screen**

Insert after the settings grid CSS (~line 200) a new block:

```css
/* ─── NAME ENTRY SCREEN ─── */
.name-entry-container {
  display: flex; gap: 60px; align-items: center; justify-content: center;
  margin-bottom: 40px; flex-wrap: wrap;
}
.name-entry-field {
  display: flex; flex-direction: column; align-items: center; gap: 15px;
}
.name-entry-label {
  font-family: 'Orbitron', monospace;
  font-size: clamp(18px, 2.5vw, 28px);
  font-weight: 700; letter-spacing: 0.1em;
}
.name-entry-input {
  background: rgba(15, 15, 40, 0.85);
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 12px;
  padding: 16px 24px;
  font-family: 'Rajdhani', sans-serif;
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 600;
  color: #fff;
  text-align: center;
  width: 280px;
  max-width: 80vw;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.name-entry-input:focus {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 20px rgba(0,240,255,0.3);
}
.name-entry-input.pink-focus:focus {
  border-color: var(--neon-pink);
  box-shadow: 0 0 20px rgba(255,45,120,0.3);
}
.name-entry-vs {
  font-family: 'Orbitron', monospace;
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 900;
  color: var(--neon-yellow);
  text-shadow: 0 0 20px rgba(255,230,0,0.4);
}
```

**Step 2: Add name entry screen HTML**

Insert between the How to Play screen (line ~1820) and Settings screen (line ~1822):

```html
<!-- ═══ NAME ENTRY SCREEN ═══ -->
<div id="screen-names" class="screen">
  <div class="screen-title">Who's Playing?</div>
  <div class="name-entry-container">
    <div class="name-entry-field">
      <div class="name-entry-label" style="color: var(--neon-cyan);">Player 1</div>
      <input type="text" id="name-p1" class="name-entry-input" maxlength="12" placeholder="Player 1" autocomplete="off" />
    </div>
    <div class="name-entry-vs">VS</div>
    <div class="name-entry-field">
      <div class="name-entry-label" style="color: var(--neon-pink);">Player 2</div>
      <input type="text" id="name-p2" class="name-entry-input pink-focus" maxlength="12" placeholder="Player 2" autocomplete="off" />
    </div>
  </div>
  <div class="btn-group btn-row" id="names-buttons">
    <button class="btn pink" onclick="showScreen('title')" style="min-width:220px;">Back</button>
    <button class="btn" onclick="confirmNames()" style="min-width:220px;">Continue</button>
  </div>
</div>
```

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add name entry screen HTML and CSS"
```

---

### Task 4: Refactor Player State to Dynamic Names

**Files:**
- Modify: `index.html` (JS section)

**Step 1: Update player state initialization (~line 3177)**

Replace the hardcoded players object:

```javascript
// Two-player state (dynamic names)
var playerNames = { p1: 'Player 1', p2: 'Player 2' };
var players = {
  p1: { name: 'Player 1', score: 0, streak: 0, bestStreak: 0, correctCount: 0, totalTime: 0 },
  p2: { name: 'Player 2', score: 0, streak: 0, bestStreak: 0, correctCount: 0, totalTime: 0 }
};
var currentPlayer = 'p1';
```

**Step 2: Add `confirmNames()` function**

Insert near `startGame()` (~line 3340):

```javascript
function confirmNames() {
  var n1 = document.getElementById('name-p1').value.trim();
  var n2 = document.getElementById('name-p2').value.trim();
  playerNames.p1 = n1 || 'Player 1';
  playerNames.p2 = n2 || 'Player 2';
  // Save to localStorage for next time
  try {
    localStorage.setItem('brainblitz_names', JSON.stringify(playerNames));
  } catch(e) {}
  showScreen('settings');
}
```

**Step 3: Add name restoration on load**

In the initialization section (near the DOMContentLoaded or end of script), add:

```javascript
// Restore last-used names
try {
  var savedNames = JSON.parse(localStorage.getItem('brainblitz_names') || '{}');
  if (savedNames.p1) {
    document.getElementById('name-p1').value = savedNames.p1;
    playerNames.p1 = savedNames.p1;
  }
  if (savedNames.p2) {
    document.getElementById('name-p2').value = savedNames.p2;
    playerNames.p2 = savedNames.p2;
  }
} catch(e) {}
```

**Step 4: Update `startGame()` (~line 3341)**

Change player initialization from hardcoded names:

```javascript
// Reset both players (use dynamic names)
players.p1 = { name: playerNames.p1, score: 0, streak: 0, bestStreak: 0, correctCount: 0, totalTime: 0 };
players.p2 = { name: playerNames.p2, score: 0, streak: 0, bestStreak: 0, correctCount: 0, totalTime: 0 };
currentPlayer = 'p1';
```

Also update `gameTracker.answerTimes` and `gameTracker.fastAnswers` and `gameTracker.blitzAnswers` to use `p1`/`p2` keys instead of `burden`/`stu`.

**Step 5: Update title screen "Let's Play!" button**

Change the onclick from `showScreen('settings')` to `showScreen('names')`:

At line 1798:
```html
<button class="btn" onclick="showScreen('names')" autofocus style="min-width:260px;">Let's Play!</button>
```

**Step 6: Update `handleBack()` to include names screen**

At line ~5142, add `'screen-names'` to the switch cases that go back to title.

**Step 7: Commit**

```bash
git add index.html
git commit -m "feat: refactor player state from hardcoded names to dynamic p1/p2"
```

---

### Task 5: Update All Hardcoded Burden/Stu References in Game Logic

**Files:**
- Modify: `index.html` (JS + HTML)

This is the largest refactor task. Every reference to `burden` or `stu` as player keys must become `p1` or `p2`.

**Step 1: Update `loadQuestion()` (~line 3512)**

- Change `currentPlayer === 'burden'` color checks to `currentPlayer === 'p1'`
- Change `hud-burden-score` / `hud-stu-score` IDs to `hud-p1-score` / `hud-p2-score`
- Change `hud-burden-section` / `hud-stu-section` to `hud-p1-section` / `hud-p2-section`

**Step 2: Update HUD HTML (~line 1875)**

Replace the game HUD player sections:
```html
<div class="hud-item" id="hud-p1-section">
  <div class="hud-label" id="hud-p1-label">Player 1</div>
  <div class="hud-value score" id="hud-p1-score">0</div>
</div>
<div class="hud-item" id="hud-p2-section">
  <div class="hud-label" id="hud-p2-label">Player 2</div>
  <div class="hud-value score" id="hud-p2-score">0</div>
</div>
```

**Step 3: Update Results screen HTML (~line 1912)**

Replace hardcoded "BURDEN" and "STU" text with dynamic elements:
- `res-burden-col` → `res-p1-col`, `res-stu-col` → `res-p2-col`
- `res-burden-score` → `res-p1-score`, etc.
- Remove hardcoded player name text; populate via JS in `endGame()`

**Step 4: Update Leaderboard screen HTML (~line 1970)**

Replace hardcoded "BURDEN" and "STU" names:
- `lb-burden-*` IDs → `lb-p1-*`
- `lb-stu-*` IDs → `lb-p2-*`
- Replace fixed text with `<span>` elements populated by JS

**Step 5: Update title screen wins display (~line 1803)**

```html
<span id="title-p1-wins"></span> &nbsp;|&nbsp; <span id="title-p2-wins"></span>
```

**Step 6: Update `selectAnswer()` (~line 3860)**

Change `players.burden.score` references to `players.p1.score` etc.

**Step 7: Update `timeUp()` (~line 3935)**

Same refactor.

**Step 8: Update `advanceAfterAnswer()` (~line 3846)**

Change `currentPlayer === 'burden' ? 'stu' : 'burden'` to `currentPlayer === 'p1' ? 'p2' : 'p1'` (this appears in `selectAnswer` and `timeUp` at lines ~3924 and ~3953).

**Step 9: Update `endGame()` (~line 4051)**

Replace all `players.burden` → `players.p1`, `players.stu` → `players.p2`. Update element IDs. Fix winner text to use dynamic names.

**Step 10: Update persistence functions**

- `loadLifetimeStats()` (~line 4120): Pass player names as query params
- `updateTitleWins()` (~line 4133): Use dynamic names
- `updateLeaderboard()` (~line 4142): Use p1/p2 IDs
- `saveGameResult()` (~line 4183): Send normalized player names

**Step 11: Update LANG translations (~line 4932)**

Replace `burdenWins` / `stuWins` with a dynamic template:
```javascript
playerWins: '{name} WINS! Lekker Gespeel!',
```
And in `endGame()`, use string replacement: `t('playerWins').replace('{name}', players.p1.name.toUpperCase())`

**Step 12: Update achievement tracking**

All `gameTracker.answerTimes.burden` → `gameTracker.answerTimes.p1`, etc.
Update `checkAndShowAchievements()` and `loadAchievements()` to use dynamic names.

**Step 13: Verify no remaining `burden`/`stu` references in game logic**

Search the file for any remaining hardcoded references. Some may legitimately remain in migration/fallback code.

**Step 14: Commit**

```bash
git add index.html
git commit -m "feat: replace all hardcoded Burden/Stu with dynamic player names"
```

---

### Task 6: Spotlight Handoff — Replace Turn Switch

**Files:**
- Modify: `index.html` (CSS + HTML + JS)

**Step 1: Update turn switch CSS (~line 648)**

Replace the existing `.turn-switch` styles with the spotlight handoff:

```css
/* ─── SPOTLIGHT HANDOFF ─── */
.turn-switch {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  z-index: 10;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}
.turn-switch.show { opacity: 1; pointer-events: all; }
.turn-switch-bg {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  opacity: 0.92;
  transition: background 0.2s ease;
}
.turn-switch-bg.p1-bg { background: linear-gradient(135deg, rgba(0,30,40,0.95), rgba(0,240,255,0.15)); }
.turn-switch-bg.p2-bg { background: linear-gradient(135deg, rgba(40,0,20,0.95), rgba(255,45,120,0.15)); }
.turn-switch-name {
  font-family: 'Orbitron', monospace;
  font-size: clamp(48px, 8vw, 100px);
  font-weight: 900;
  letter-spacing: 0.1em;
  z-index: 1;
  animation: spotlightPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
.turn-switch-label {
  font-family: 'Orbitron', monospace;
  font-size: clamp(16px, 2vw, 24px);
  color: rgba(255,255,255,0.6);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  z-index: 1;
  margin-top: 15px;
  animation: spotlightFade 0.6s ease forwards;
  animation-delay: 0.2s;
  opacity: 0;
}
@keyframes spotlightPop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes spotlightFade {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

**Step 2: Update turn switch HTML overlay (~line 2134)**

```html
<!-- Spotlight handoff overlay -->
<div class="turn-switch" id="turn-switch">
  <div class="turn-switch-bg" id="turn-switch-bg"></div>
  <div class="turn-switch-name" id="turn-switch-name"></div>
  <div class="turn-switch-label" id="turn-switch-label">PASS THE REMOTE</div>
</div>
```

**Step 3: Replace `showTurnSwitch()` JS function (~line 3470)**

```javascript
function showTurnSwitch(playerKey, cb) {
  if (turnSwitchInterval) { clearTimeout(turnSwitchInterval); turnSwitchInterval = null; }
  var overlay = document.getElementById('turn-switch');
  var nameEl = document.getElementById('turn-switch-name');
  var bgEl = document.getElementById('turn-switch-bg');
  var labelEl = document.getElementById('turn-switch-label');
  var name = players[playerKey].name.toUpperCase();
  var isP1 = playerKey === 'p1';

  nameEl.textContent = name;
  nameEl.style.color = isP1 ? 'var(--neon-cyan)' : 'var(--neon-pink)';
  nameEl.style.textShadow = '0 0 40px ' + (isP1 ? 'rgba(0,240,255,0.5)' : 'rgba(255,45,120,0.5)');

  // Reset animations
  nameEl.style.animation = 'none';
  labelEl.style.animation = 'none';
  void nameEl.offsetHeight; // Force reflow
  nameEl.style.animation = 'spotlightPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
  labelEl.style.animation = 'spotlightFade 0.6s ease forwards 0.2s';
  labelEl.style.opacity = '0';
  labelEl.textContent = 'PASS THE REMOTE';

  bgEl.className = 'turn-switch-bg ' + (isP1 ? 'p1-bg' : 'p2-bg');
  overlay.classList.add('show');
  sfxWhoosh();

  turnSwitchInterval = setTimeout(function() {
    turnSwitchInterval = null;
    overlay.classList.remove('show');
    if (cb) cb();
  }, 1200);
}
```

**Step 4: Update `advanceAfterAnswer()` to reduce round splash frequency (~line 3846)**

```javascript
function advanceAfterAnswer() {
  currentQ++;
  if (currentQ < questions.length) {
    showTurnSwitch(currentPlayer, function() {
      // Only show round splash every 5 questions
      if (currentQ % 5 === 0) {
        showRoundSplash(currentQ + 1, function() { loadQuestion(); });
      } else {
        loadQuestion();
      }
    });
  } else {
    endGame();
  }
}
```

**Step 5: Add active/inactive player HUD styles**

Add CSS:
```css
.hud-item.player-active {
  border: 2px solid var(--neon-cyan);
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0,240,255,0.3);
  transform: scale(1.05);
  transition: all 0.3s ease;
}
.hud-item.player-active.p2-active {
  border-color: var(--neon-pink);
  box-shadow: 0 0 15px rgba(255,45,120,0.3);
}
.hud-item.player-inactive {
  opacity: 0.5;
  transition: opacity 0.3s ease;
}
```

Update `loadQuestion()` to apply these classes to the player HUD sections.

**Step 6: Commit**

```bash
git add index.html
git commit -m "feat: replace turn switch with spotlight handoff (1.2s dramatic wipe)"
```

---

### Task 7: LG TV Visual Polish — CSS Updates

**Files:**
- Modify: `index.html` (CSS section)

**Step 1: Increase font sizes for big-screen readability**

Update question text (~line where `.question-text` is defined):
```css
.question-text {
  font-size: clamp(2rem, 3.5vw, 3rem);
}
```

Update answer button text:
```css
.answer-btn {
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  min-height: 80px;
}
```

Update HUD values:
```css
.hud-value {
  font-size: clamp(1.3rem, 2.5vw, 2rem);
  font-weight: 700;
}
.hud-value.score {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
}
```

**Step 2: Enhanced focus states**

Update `.answer-btn:hover, .answer-btn:focus` (~line 398):
```css
.answer-btn:hover, .answer-btn:focus {
  border-color: var(--neon-cyan);
  background: rgba(0,240,255,0.12);
  transform: scale(1.04);
  box-shadow: 0 0 30px rgba(0,240,255,0.25), inset 0 0 15px rgba(0,240,255,0.08);
  outline: none;
}
```

Add a pulsing focus animation:
```css
@keyframes focusPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(0,240,255,0.2); }
  50% { box-shadow: 0 0 35px rgba(0,240,255,0.4); }
}
.answer-btn:focus {
  animation: focusPulse 1.5s ease-in-out infinite;
}
```

Update general focus-visible (~line 1351):
```css
*:focus-visible {
  outline: 3px solid var(--neon-cyan);
  outline-offset: 4px;
  box-shadow: 0 0 15px rgba(0,240,255,0.3);
}
```

**Step 3: Higher contrast difficulty badges**

Ensure difficulty badge colors have sufficient contrast on dark backgrounds. Update any muted badge colors.

**Step 4: Increase particle counts**

In `spawnParticles()`, increase the count parameter call from 12 to 20.

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: TV visual polish — larger fonts, better focus states, more particles"
```

---

### Task 8: Remote-Friendly Controls & Performance

**Files:**
- Modify: `index.html` (CSS + JS)

**Step 1: Add input debouncing**

Near `selectAnswer()` (~line 3860), add a debounce guard:

```javascript
var lastAnswerTime = 0;
function selectAnswer(btn) {
  var now = Date.now();
  if (now - lastAnswerTime < 300) return;
  lastAnswerTime = now;
  if (answered || ttsPlaying || isPaused) return;
  // ... rest of function
```

Add similar debounce to the back button handler.

**Step 2: Wrap-around d-pad navigation**

In `handleArrowNav()` (~line 5157), update the 2x2 grid navigation to wrap:

```javascript
case 'ArrowRight': newIdx = idx % 2 === 0 ? idx + 1 : idx - 1; break;
case 'ArrowLeft': newIdx = idx % 2 === 1 ? idx - 1 : idx + 1; break;
```

**Step 3: Add `will-change` to frequently animated elements**

```css
.timer-fill { will-change: transform; }
.hud-value.score { will-change: transform; }
.answer-btn { will-change: transform, box-shadow; }
```

**Step 4: Ensure all clickable elements have minimum 64x64px targets**

Add to the `.pill` class:
```css
.pill { min-height: 48px; min-width: 64px; }
```

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: remote-friendly controls — debouncing, wrap nav, will-change hints"
```

---

### Task 9: Cape Town Coffee & Cafes Questions

**Files:**
- Modify: `index.html` (QUESTION_BANK, ~line 2854)

**Step 1: Add "CT Coffee & Cafes" category with ~45 questions**

Insert into QUESTION_BANK after existing categories. Questions should cover:
- Truth Coffee (steampunk theme, voted best coffee shop in the world)
- Origin Coffee Roasting (De Waterkant, specialty roasters)
- Rosetta Roastery (Woodstock)
- Deluxe Coffeeworks (single-origin)
- Tribe Coffee (Woodstock, roastery + cafe)
- Bootlegger Coffee Company (multiple locations)
- Espresso Lab Microroasters
- Bean There (fair trade)
- Jason Bakery (croissants + coffee)
- Kloof Street cafe culture
- Bree Street food corridor
- Woodstock Exchange
- Cape Town Coffee Festival
- Coffee processing methods common in SA
- Flat white vs cortado culture in CT

Each question: `{category:"CT Coffee & Cafes", question:"...", correct_answer:"...", incorrect_answers:["...","...","..."], difficulty: 1|2|3}`

Difficulty split: ~18 easy (1), ~16 medium (2), ~11 hard (3).

**Step 2: Add category pill to settings screen**

Add to `#cat-pills` (~line 1828):
```html
<button class="pill" data-val="CT Coffee & Cafes" onclick="selectPill(this,'cat')">CT Coffee & Cafes</button>
```

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Cape Town Coffee & Cafes trivia category (45 questions)"
```

---

### Task 10: Cape Winelands Questions

**Files:**
- Modify: `index.html` (QUESTION_BANK + settings pills)

**Step 1: Add "Cape Winelands" category with ~45 questions**

Topics:
- Constantia (oldest wine region, Groot Constantia, Klein Constantia)
- Stellenbosch estates (Rust en Vrede, Tokara, Delaire Graff, Jordan)
- Franschhoek (Huguenots, La Motte, Haute Cabriere, tram)
- Hemel-en-Aarde Valley (Creation, Hamilton Russell, Bouchard Finlayson)
- Pinotage (origin, Beyers Truter, Kanonkop)
- Chenin Blanc (SA's signature white)
- MCC (Methode Cap Classique) sparkling wines
- The Chocolate Block (Boekenhoutskloof)
- Wine Tram route (Franschhoek)
- Grape varieties unique to/popular in SA
- Wine and food pairing traditions
- Harvest festivals (Stellenbosch Wine Festival)
- Robertson, Swartland, Tulbagh
- Wine scoring and competitions (Platter's Guide)

**Step 2: Add category pill**

```html
<button class="pill" data-val="Cape Winelands" onclick="selectPill(this,'cat')">Cape Winelands</button>
```

**Step 3: Also add ~15 Cape-specific questions to existing "SA Wines" category**

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add Cape Winelands trivia category (45 questions) + SA Wines additions"
```

---

### Task 11: Cape Town Foodie Questions

**Files:**
- Modify: `index.html` (QUESTION_BANK + settings pills)

**Step 1: Add "CT Foodie" category with ~45 questions**

Topics:
- The Test Kitchen (Luke Dale-Roberts, awards)
- La Colombe (Constantia, tasting menu, reputation)
- Harbour House (Kalk Bay, seafood)
- Pot Luck Club (Woodstock, social dining)
- Old Biscuit Mill (Neighbourgoods Market, Saturday market)
- Oranjezicht City Farm Market (V&A Waterfront)
- Gatsby sandwich (origin, Super Fisheries, where to get the best)
- Cape Malay cuisine (bobotie, bredies, samoosas, Bo-Kaap)
- Koeksisters (Cape Malay vs Afrikaans style)
- Biltong and droewors culture
- Snoek (braai, smoked, pate)
- Waterblommetjie bredie
- Hout Bay fish market (Mariner's Wharf, Fish on the Rocks)
- District Six culinary heritage
- Rooibos (origin, Cederberg, uses)
- Craft beer scene (Devil's Peak, Jack Black, Darling Brew)

**Step 2: Add category pill**

```html
<button class="pill" data-val="CT Foodie" onclick="selectPill(this,'cat')">CT Foodie</button>
```

**Step 3: Also add ~15 questions to existing "SA Food & Slang" category**

Cape Malay slang, District Six terminology, Cape Flats expressions.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add Cape Town Foodie trivia category (45 questions) + SA Food additions"
```

---

### Task 12: Cape Adventures Questions

**Files:**
- Modify: `index.html` (QUESTION_BANK + settings pills)

**Step 1: Add "Cape Adventures" category with ~45 questions**

Topics:
- Table Mountain routes (Platteklip Gorge, India Venster, Skeleton Gorge, Kasteelspoort)
- Table Mountain cableway (history, stats, revolving floor)
- Lion's Head (sunrise/full moon hikes, chains section)
- Chapman's Peak Drive (tollgate, history, cycling)
- Cape Point (Cape of Good Hope, Flying Dutchman funicular, baboons)
- Muizenberg surfing (Surf Emporium, shark spotters, colourful beach huts)
- Boulders Beach penguins (African penguin colony, Simonstown)
- Shark cage diving (Gansbaai, False Bay)
- Paragliding from Signal Hill/Lion's Head
- Kirstenbosch (Tree Canopy Walk, summer concerts, Boomslang)
- Two Oceans Aquarium
- Robben Island (history + boat ride)
- Constantia Greenbelts (cycling, trail running)
- Cape to Cape MTB
- Coasteering along False Bay
- Abseiling off Table Mountain
- Cape Canopy Tour (Elgin)
- V&A Waterfront (history, Zeitz MOCAA)

**Step 2: Add category pill**

```html
<button class="pill" data-val="Cape Adventures" onclick="selectPill(this,'cat')">Cape Adventures</button>
```

**Step 3: Also add ~15 questions to existing "Hiking" category**

Cape Town specific hiking trails.

**Step 4: Also add ~10 True or False questions about Cape Town**

Myth-busting facts (Table Mountain one of New 7 Wonders, Cape Town is southernmost city in Africa — False, etc.)

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add Cape Adventures trivia category (45 questions) + hiking/T-or-F additions"
```

---

### Task 13: Final Integration & Verification

**Files:**
- Modify: `index.html` (various)

**Step 1: Update the `showScreen()` function to handle `names` screen**

Ensure the names screen is included in screen transitions, music changes, and back navigation.

**Step 2: Set player HUD labels dynamically on game start**

In `startGame()` or `loadQuestion()`, set the HUD label text:
```javascript
document.getElementById('hud-p1-label').textContent = players.p1.name;
document.getElementById('hud-p2-label').textContent = players.p2.name;
```

And set the results screen player names:
```javascript
document.getElementById('res-p1-name').textContent = players.p1.name.toUpperCase();
document.getElementById('res-p2-name').textContent = players.p2.name.toUpperCase();
```

And leaderboard names:
```javascript
document.getElementById('lb-p1-name').textContent = players.p1.name.toUpperCase();
document.getElementById('lb-p2-name').textContent = players.p2.name.toUpperCase();
```

**Step 3: Full webOS compatibility scan**

Search entire file for:
- `?.` (optional chaining)
- `??` (nullish coalescing)
- `[...` followed by `]` (spread syntax — watch for false positives in strings)
- `inset:` or `inset :` in CSS

Fix any violations.

**Step 4: Test the game flow end-to-end mentally**

Walk through: Title → Names → Settings → Game (turn switches, scoring) → Results → Leaderboard. Verify all dynamic names appear correctly.

**Step 5: Final commit**

```bash
git add index.html
git commit -m "feat: final integration — dynamic names in all screens, webOS compatibility verified"
```

---

## Task Dependency Order

```
Task 1 ──┐
Task 2 ──┤ (API layer, independent of frontend)
         │
Task 3 ──┤ (HTML + CSS for name entry)
Task 4 ──┤ (State refactor, depends on Task 3)
Task 5 ──┘ (Full Burden/Stu replacement, depends on Task 4)
         │
Task 6 ──┤ (Spotlight handoff, depends on Task 5 for p1/p2 keys)
Task 7 ──┤ (Visual polish, independent CSS work)
Task 8 ──┤ (Remote controls, independent CSS/JS work)
         │
Task 9 ──┐
Task 10 ─┤ (Trivia questions, all independent of each other)
Task 11 ─┤
Task 12 ─┘
         │
Task 13 ── (Integration, depends on all above)
```

**Parallelizable tasks:**
- Tasks 1+2 (API changes) can run in parallel
- Tasks 7+8 (CSS polish + controls) can run in parallel
- Tasks 9+10+11+12 (trivia categories) can all run in parallel

**Estimated total:** 13 tasks, ~500-700 lines of code changed/added, ~200+ trivia questions.
