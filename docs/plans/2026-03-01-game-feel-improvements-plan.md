# Game Feel & Competitive Improvements Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 8 game feel and competitive features to make BrainBlitz more exciting on the TV.

**Architecture:** All changes are in `index.html` (single-file app). Features are independent - CSS additions near existing styles, JS additions near related functions. No API changes needed.

**Tech Stack:** Vanilla JS, CSS animations, Web Audio API. Must avoid `?.`, `??`, spread `[...arr]`, `.includes()`, `inset: 0`.

---

### Task 1: Live Streak Fire Indicator in HUD

Add a visible flame/streak counter below each player's score in the HUD during gameplay. Shows `🔥×3`, `🔥×5` etc. Hidden when streak is 0.

**Files:**
- Modify: `index.html` - HUD HTML (~line 1999-2003), CSS, and JS (`selectAnswer`, `loadQuestion`, `startGame`)

**Step 1: Add streak HTML elements to HUD**

After `hud-p1-score` (line 1999) and `hud-p2-score` (line 2003), add streak display divs:

```html
<!-- Inside hud-p1-section, after score div -->
<div class="hud-streak" id="hud-p1-streak"></div>

<!-- Inside hud-p2-section, after score div -->
<div class="hud-streak" id="hud-p2-streak"></div>
```

**Step 2: Add CSS for streak indicator**

Add near existing HUD styles:

```css
.hud-streak {
  font-size: clamp(0.8rem, 1.5vw, 1.1rem);
  color: var(--neon-yellow);
  min-height: 1.2em;
  text-shadow: 0 0 8px rgba(255, 230, 0, 0.6);
  transition: opacity 0.3s ease;
}
```

**Step 3: Add updateStreakHUD function**

Add after `updateScoreDisplay` function (~line 4348):

```javascript
function updateStreakHUD(playerKey) {
  var el = document.getElementById('hud-' + playerKey + '-streak');
  var streak = players[playerKey].streak;
  if (streak >= 2) {
    el.textContent = '\ud83d\udd25\u00d7' + streak;
    el.style.opacity = '1';
  } else {
    el.textContent = '';
    el.style.opacity = '0';
  }
}
```

**Step 4: Call updateStreakHUD after answer**

In `selectAnswer()`, after the streak is updated (after line 4285), add:

```javascript
updateStreakHUD('p1');
updateStreakHUD('p2');
```

Also in `timeUp()` after streak reset (after line 4309), add the same calls.

**Step 5: Reset streak HUD on game start**

In `startGame()`, after setting HUD labels (after line 3708), add:

```javascript
document.getElementById('hud-p1-streak').textContent = '';
document.getElementById('hud-p2-streak').textContent = '';
```

**Step 6: Commit**

```
git commit -m "feat: add live streak fire indicator in gameplay HUD"
```

---

### Task 2: Score Count-Up Animation

Replace the instant score update with an animated counter that counts up from old score to new score, plus a points-earned popup.

**Files:**
- Modify: `index.html` - `updateScoreDisplay` function (~line 4338), add CSS for points popup

**Step 1: Add CSS for floating points popup**

```css
.points-earned {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Orbitron', monospace;
  font-size: clamp(0.9rem, 1.5vw, 1.2rem);
  color: var(--neon-green);
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.8);
  pointer-events: none;
  animation: pointsFloat 1s ease-out forwards;
  z-index: 15;
}
@keyframes pointsFloat {
  0% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-30px); }
}
```

**Step 2: Make HUD score items position:relative**

Add to `.hud-item` CSS: `position: relative;`

**Step 3: Rewrite updateScoreDisplay to animate count-up**

Replace the existing `updateScoreDisplay` function:

```javascript
function updateScoreDisplay(id, score, points) {
  var el = document.getElementById(id);
  var oldScore = parseInt(el.textContent.replace(/,/g, '')) || 0;
  var newScore = score;
  if (oldScore === newScore) return;

  // Animate count-up
  var duration = 400;
  var startTime = performance.now();
  function tick(now) {
    var progress = Math.min((now - startTime) / duration, 1);
    // Ease-out cubic
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = Math.round(oldScore + (newScore - oldScore) * eased);
    el.textContent = formatScore(current);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Pop animation
  el.classList.remove('score-pop');
  void el.offsetHeight;
  el.classList.add('score-pop');

  // Floating points popup
  if (points && points > 0) {
    var popup = document.createElement('div');
    popup.className = 'points-earned';
    popup.textContent = '+' + points;
    el.parentElement.appendChild(popup);
    setTimeout(function() { popup.remove(); }, 1100);
  }
}
```

**Step 4: Pass points to updateScoreDisplay calls**

In `selectAnswer()`, change the update calls (line 4284-4285):

```javascript
// Only pass points for the player who just answered
var earnedId = (currentPlayer === 'p2') ? 'hud-p1-score' : 'hud-p2-score';
// currentPlayer has already been swapped by line 4295, so the player who answered is the opposite
updateScoreDisplay('hud-p1-score', players.p1.score, currentPlayer === 'p2' ? null : points);
updateScoreDisplay('hud-p2-score', players.p2.score, currentPlayer === 'p1' ? null : points);
```

Wait - `currentPlayer` hasn't been swapped yet at line 4284. So the current player IS the answerer. Pass `points` only for the current player's score element:

```javascript
updateScoreDisplay('hud-p1-score', players.p1.score, currentPlayer === 'p1' ? points : null);
updateScoreDisplay('hud-p2-score', players.p2.score, currentPlayer === 'p2' ? points : null);
```

Note: `points` is only defined in the `isCorrect` branch. For wrong answers, `points` is undefined, so no popup shows. This is the desired behavior.

**Step 5: Commit**

```
git commit -m "feat: animated score count-up with floating points popup"
```

---

### Task 3: Enhanced SFX - Final Question Sting

Add a dramatic SFX sting when the FINAL question loads, signaling the climax.

**Files:**
- Modify: `index.html` - add `sfxFinalQuestion` function, trigger in `loadQuestion`

**Step 1: Add sfxFinalQuestion function**

Add after `sfxVictory` (~line 2449):

```javascript
function sfxFinalQuestion() {
  // Dramatic 3-note descending power chord
  ensureAudio();
  playTone(330, 0.3, 'sawtooth', 0.08);
  setTimeout(function() { playTone(294, 0.3, 'sawtooth', 0.08); }, 200);
  setTimeout(function() { playTone(262, 0.5, 'sawtooth', 0.10); }, 400);
  // Add a low rumble
  setTimeout(function() { playTone(110, 0.6, 'sine', 0.06); }, 100);
}
```

**Step 2: Trigger in loadQuestion when it's the last question**

In `loadQuestion()`, after the question text is set on screen but before TTS/timer starts, add a check:

```javascript
// Final question dramatic sting
if (currentQ === questions.length - 1) {
  sfxFinalQuestion();
  showBonus('\u26a1 FINAL QUESTION! \u26a1');
}
```

**Step 3: Commit**

```
git commit -m "feat: dramatic SFX sting on final question"
```

---

### Task 4: Comeback Round - Double Points on Final Question

If the score difference on the final question is close (within 200 points), the final question is worth double points.

**Files:**
- Modify: `index.html` - `loadQuestion` and `selectAnswer` functions, add visual indicator

**Step 1: Add CSS for double-points indicator**

```css
.double-points-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, var(--neon-yellow), #ff8800);
  color: #000;
  font-family: 'Orbitron', monospace;
  font-size: clamp(0.7rem, 1.2vw, 0.9rem);
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  animation: doublePulse 0.6s ease-in-out infinite alternate;
  z-index: 10;
}
@keyframes doublePulse {
  from { transform: scale(1); box-shadow: 0 0 10px rgba(255, 230, 0, 0.5); }
  to { transform: scale(1.08); box-shadow: 0 0 20px rgba(255, 230, 0, 0.8); }
}
```

**Step 2: Add isDoublePoints flag**

Add a variable near the game state variables:

```javascript
var isDoublePoints = false;
```

**Step 3: Check and activate in loadQuestion**

In `loadQuestion()`, after setting the question text, add:

```javascript
// Comeback round: double points if final question and scores are close
isDoublePoints = false;
var dpBadge = document.getElementById('double-points-badge');
if (dpBadge) dpBadge.remove();

if (currentQ === questions.length - 1) {
  var scoreDiff = Math.abs(players.p1.score - players.p2.score);
  if (scoreDiff <= 200) {
    isDoublePoints = true;
    var badge = document.createElement('div');
    badge.className = 'double-points-badge';
    badge.id = 'double-points-badge';
    badge.textContent = '2\u00d7 POINTS!';
    document.getElementById('screen-game').appendChild(badge);
  }
}
```

**Step 4: Apply double points in selectAnswer**

In `selectAnswer()`, after calculating `points` (line 4259), add:

```javascript
if (isDoublePoints) points = points * 2;
```

**Step 5: Reset flag in startGame**

In `startGame()`, add:

```javascript
isDoublePoints = false;
```

**Step 6: Commit**

```
git commit -m "feat: comeback round - double points on final question when scores are close"
```

---

### Task 5: Quick Rematch Button

Add a "Rematch!" button on the results screen that restarts the game with the same settings but swaps who goes first.

**Files:**
- Modify: `index.html` - results screen HTML, add `rematch` function

**Step 1: Add Rematch button to results screen**

Replace the existing button group (line 2060-2063):

```html
<div class="btn-group btn-row">
  <button class="btn" onclick="rematch()" style="min-width:220px;" autofocus>Rematch!</button>
  <button class="btn pink" onclick="startGame()" style="min-width:180px;">New Game</button>
  <button class="btn pink" onclick="showScreen('title')" style="min-width:140px;">Home</button>
</div>
```

**Step 2: Add rematch tracking variable**

Add near game state:

```javascript
var lastStartingPlayer = 'p1';
```

**Step 3: Set lastStartingPlayer in startGame**

In `startGame()`, after `currentPlayer = 'p1'` (line 3701), change to:

```javascript
currentPlayer = lastStartingPlayer;
```

**Step 4: Add rematch function**

Add after `endGame`:

```javascript
function rematch() {
  // Swap who goes first
  lastStartingPlayer = lastStartingPlayer === 'p1' ? 'p2' : 'p1';
  startGame();
}
```

**Step 5: Reset starting player on new game from title/settings**

When the user navigates through the normal flow (title → names → settings → play), reset to p1. In `confirmNames()` or at the start of `startGame` when coming from settings, ensure:

Actually, keep it simple: `startGame()` already sets `currentPlayer = 'p1'`. Change it to use `lastStartingPlayer`. The `rematch()` function swaps it. When going through normal flow, `lastStartingPlayer` stays as whatever it was, which is fine - it means the "loser" of the previous session gets to start next time, even across full game restarts. This is actually good behavior.

**Step 6: Commit**

```
git commit -m "feat: quick rematch button - swaps starting player"
```

---

### Task 6: Enhanced Head-to-Head Display on Title Screen

Make the win record more prominent with larger text, player colors, and a "vs" separator.

**Files:**
- Modify: `index.html` - `lifetime-wins` HTML and `updateTitleWins` function

**Step 1: Replace lifetime-wins HTML**

Replace the existing `lifetime-wins` div (line 1886-1888):

```html
<div id="lifetime-wins" style="margin-top:30px; opacity:0; transition:opacity 0.5s ease;">
  <div style="font-family:'Orbitron',monospace; font-size:clamp(12px,1.2vw,16px); color:rgba(255,255,255,0.4); letter-spacing:0.15em; margin-bottom:8px;">HEAD TO HEAD</div>
  <div style="display:flex; align-items:center; justify-content:center; gap:15px; font-family:'Orbitron',monospace;">
    <span id="title-p1-wins" style="font-size:clamp(18px,2.5vw,28px); color:var(--neon-cyan); text-shadow:0 0 10px rgba(0,240,255,0.4);">0</span>
    <span style="font-size:clamp(14px,1.5vw,20px); color:rgba(255,255,255,0.3);">vs</span>
    <span id="title-p2-wins" style="font-size:clamp(18px,2.5vw,28px); color:var(--neon-pink); text-shadow:0 0 10px rgba(255,45,120,0.4);">0</span>
  </div>
</div>
```

**Step 2: Update updateTitleWins to show names and win counts**

Replace the `updateTitleWins` function:

```javascript
function updateTitleWins() {
  if (!lifetimeStats) return;
  var p1Stats = lifetimeStats.p1 || lifetimeStats.burden || {};
  var p2Stats = lifetimeStats.p2 || lifetimeStats.stu || {};
  var p1Wins = p1Stats.wins || 0;
  var p2Wins = p2Stats.wins || 0;
  document.getElementById('title-p1-wins').innerHTML = playerNames.p1.toUpperCase() + '<br>' + p1Wins + ' win' + (p1Wins !== 1 ? 's' : '');
  document.getElementById('title-p2-wins').innerHTML = playerNames.p2.toUpperCase() + '<br>' + p2Wins + ' win' + (p2Wins !== 1 ? 's' : '');
  document.getElementById('lifetime-wins').style.opacity = '1';
}
```

**Step 3: Commit**

```
git commit -m "feat: enhanced head-to-head win display on title screen"
```

---

### Task 7: Victory Celebration Overhaul

Different victory animations based on margin: blowout (>300 pts), close game (<100 pts), comeback (was losing, now winning), and draw. More confetti for blowouts, dramatic music for close games.

**Files:**
- Modify: `index.html` - `endGame` function, `createConfetti` function, add new SFX

**Step 1: Add sfxCloseWin function**

Add after `sfxVictory`:

```javascript
function sfxCloseWin() {
  // Tense build then resolution
  ensureAudio();
  playTone(262, 0.2, 'sine', 0.08);
  setTimeout(function() { playTone(294, 0.2, 'sine', 0.08); }, 200);
  setTimeout(function() { playTone(330, 0.2, 'sine', 0.08); }, 400);
  setTimeout(function() { playTone(392, 0.2, 'sine', 0.1); }, 600);
  setTimeout(function() { playTone(523, 0.5, 'sine', 0.12); }, 800);
}
```

**Step 2: Add CSS for victory variants**

```css
.victory-text-blowout {
  animation: blowoutPulse 0.5s ease-in-out 3;
}
@keyframes blowoutPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
.victory-text-close {
  animation: closeShake 0.3s ease-in-out 2;
}
@keyframes closeShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
```

**Step 3: Rewrite endGame with victory variants**

Replace the winner determination section in `endGame()` (lines 4449-4472):

```javascript
var trophy = document.getElementById('res-trophy');
var winnerEl = document.getElementById('res-winner');

// Determine winner and margin
var winnerText = '';
var margin = Math.abs(players.p1.score - players.p2.score);
var winnerKey = null;

if (players.p1.score > players.p2.score) {
  winnerKey = 'p1';
  winnerText = t('playerWins').replace('{name}', players.p1.name.toUpperCase());
  p1Col.classList.add('winner-column');
  p2Col.classList.add('loser-column');
  trophy.style.display = 'block';
} else if (players.p2.score > players.p1.score) {
  winnerKey = 'p2';
  winnerText = t('playerWins').replace('{name}', players.p2.name.toUpperCase());
  p2Col.classList.add('winner-column');
  p1Col.classList.add('loser-column');
  trophy.style.display = 'block';
} else {
  // Draw
  winnerText = t('draw');
  trophy.style.display = 'none';
  sfxDraw();
  Music.draw();
}

winnerEl.textContent = winnerText;
winnerEl.className = 'rank-text';

if (winnerKey) {
  // Check for comeback: winner was losing at the halfway point
  var halfwayIdx = Math.floor(gameTracker.scoreDiffs.length / 2);
  var halfwayDiff = gameTracker.scoreDiffs[halfwayIdx] || 0;
  var isComeback = (winnerKey === 'p1' && halfwayDiff < -50) || (winnerKey === 'p2' && halfwayDiff > 50);

  if (isComeback) {
    // COMEBACK WIN - dramatic build
    winnerEl.textContent = '\ud83d\udd25 COMEBACK! ' + winnerText;
    sfxCloseWin();
    Music.victory();
    createConfetti(80);
  } else if (margin > 300) {
    // BLOWOUT - big celebration
    winnerEl.classList.add('victory-text-blowout');
    sfxVictory();
    Music.victory();
    createConfetti(120);
    sfxCrowdCheer();
  } else if (margin <= 100) {
    // CLOSE GAME - tense resolution
    winnerEl.classList.add('victory-text-close');
    winnerEl.textContent = '\ud83d\ude2c ' + winnerText;
    sfxCloseWin();
    Music.victory();
    createConfetti(40);
  } else {
    // NORMAL WIN
    sfxVictory();
    Music.victory();
    createConfetti(60);
  }
}
```

**Step 4: Update createConfetti to accept a count parameter**

Change `createConfetti()` signature:

```javascript
function createConfetti(count) {
  count = count || 60;
  // ... rest stays the same but use `count` instead of hardcoded 60
```

**Step 5: Commit**

```
git commit -m "feat: victory celebration variants - blowout, close game, comeback"
```

---

### Task 8: Background Music Transitions

Ensure music transitions are smooth: stop game music before victory/draw, fade between states, and add a brief silence before the victory fanfare for dramatic effect.

**Files:**
- Modify: `index.html` - `endGame` function, Music object

**Step 1: Add dramatic pause before victory music**

In `endGame()`, stop the game music first with a fade, then delay the victory celebration:

Before the winner determination code, add:

```javascript
Music.stop(300); // Fade out game music over 300ms
```

Then wrap the SFX/music triggers in a short delay (500ms) so there's a beat of silence:

The victory SFX calls should be wrapped:

```javascript
setTimeout(function() {
  // Play the appropriate SFX and music here
  if (isComeback) { ... }
  else if (margin > 300) { ... }
  // etc.
}, 500);
```

**Step 2: Ensure createConfetti also fires after delay**

Move the confetti call inside the same setTimeout so it syncs with the music.

**Step 3: Commit**

```
git commit -m "feat: dramatic pause before victory music for tension"
```

---

## Task Dependency Order

Tasks 1-6 are independent. Task 7 is independent but modifies `endGame` which Task 8 also modifies, so do them in order. Task 8 applies on top of Task 7.

**Recommended execution order:** 1, 2, 3, 4, 5, 6, 7, 8
