# Category Roulette, Themed Music & ElevenLabs Cleanup Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Category Roulette mode, category-themed Web Audio music, and strip all ElevenLabs dependencies (TTS, music gen, admin panels) while keeping cached SFX playback.

**Architecture:** All UI/game logic in `index.html`. ElevenAudio object slimmed to SFX-only (still loads cached SFX from `/api/sfx`). Delete `tts.js`, `music.js`, `tts-usage.js`. Strip generation code from `sfx.js` keeping GET-only. Music object rewritten with category-themed synth tracks replacing ElevenLabs fallback pattern.

**Tech Stack:** Vanilla JS, Web Audio API, CSS transforms (no canvas). webOS compat: no `?.`, `??`, `[...arr]`, `.includes()`, `inset: 0`.

---

### Task 1: Strip ElevenLabs TTS

Remove TTS system entirely - the voice reading questions aloud.

**Files:** Modify `index.html`

**Changes:**

1. Delete the Voice setting group (lines 2058-2065):
   ```html
   <!-- DELETE entire voice setting-group -->
   ```

2. Remove `voiceEnabled`, `voiceId` variable declarations (lines 3640-3641)

3. In `startGame()` (lines 3809-3811), remove the voice setting reads:
   ```javascript
   // DELETE these 3 lines
   const voiceSetting = getSelected('voice');
   voiceEnabled = voiceSetting !== 'off';
   voiceId = voiceSetting === 'custom' ? '5W1ijlUigww8GacnRjZV' : '21m00Tcm4TlvDq8ikWAM';
   ```

4. In `loadQuestion()`, remove TTS block (lines 4085-4092):
   ```javascript
   // DELETE this block
   if (voiceEnabled) { ... await playQuestionTTS ... }
   ```

5. Also in `loadQuestion()` (line 4019), simplify HUD player display - remove speaker icon:
   ```javascript
   // CHANGE FROM:
   playerEl.innerHTML = players[currentPlayer].name +
     (voiceEnabled ? '<span ...>🔊</span>' : '');
   // TO:
   playerEl.textContent = players[currentPlayer].name;
   ```

6. Delete the entire `playQuestionTTS` function (lines 4857-4882)

7. Remove `ttsPlaying` variable (line 3632) and all guard references:
   - Line 4007: `ttsPlaying = false;` in loadQuestion
   - Line 4392: `if (answered || ttsPlaying || isPaused) return;` → `if (answered || isPaused) return;`
   - Line 5765: same guard in keyboard handler
   - Line 5799: same guard in D-pad handler

8. Remove `voice: 'Voice'` from LANG.en and LANG.af

9. Remove `.hud-speaker` and `.hud-speaker.loading` CSS (lines 332, 375)

10. Remove speaker icon from initial HUD HTML (line 2086)

**Commit:** `refactor: remove ElevenLabs TTS system`

---

### Task 2: Strip ElevenLabs Admin Panels

Remove cost tracker and audio asset manager from admin.

**Files:** Modify `index.html`

**Changes:**

1. Delete the "ElevenLabs Costs" admin section (lines 2240-2279) - the entire `<div class="admin-section">` block

2. Delete the "Audio Assets (ElevenLabs)" admin section (lines 2292-2316) - the entire `<div class="admin-section">` block

3. Remove `loadAdminCosts()` and `loadAdminAudio()` calls from PIN success handler (lines 5243-5244)

4. Delete JS functions:
   - `loadAdminCosts()` (line 5278, ~90 lines)
   - `loadAdminAudio()` (line 5371, ~55 lines)
   - `generateSingleAudio()` (line 5426, ~40 lines)
   - `generateAllMusic()` (line 5468, ~15 lines)
   - `generateAllSfx()` (line 5484, ~15 lines)
   - `generateSingleAudioAsync()` (line 5500, ~35 lines)

**Commit:** `refactor: remove ElevenLabs admin panels (costs + asset manager)`

---

### Task 3: Slim ElevenAudio to SFX-Only

Remove music loading from ElevenAudio, keep SFX cache.

**Files:** Modify `index.html`

**Changes:**

1. In ElevenAudio object (line 2383), remove:
   - `music: {}` property
   - `MUSIC_NAMES` array
   - The music loading loop in `loadAll()` (lines 2403-2409)

2. In Music object, remove `_playEleven()` method entirely (lines 2703-2718)

3. Remove all `_playEleven` calls from Music track methods:
   - `title()` line 2814: remove `if (self._playEleven('title'...)) { ... return; }` and the surrounding setTimeout wrapper
   - `game()` line 2896: same pattern
   - `victory()` line 2972: same pattern
   - `draw()` line 3027: same pattern

   Each track method should go straight to its Web Audio synth code without the ElevenLabs attempt.

4. Remove `_elevenSource` property and its cleanup in `stop()` (lines 2638-2643)

**Commit:** `refactor: slim ElevenAudio to SFX-only, remove music cache`

---

### Task 4: Delete ElevenLabs API Files

**Files:**
- Delete: `functions/api/tts.js`
- Delete: `functions/api/tts-usage.js`
- Delete: `functions/api/music.js`

Keep: `functions/api/sfx.js` (modified in next task)

**Commit:** `refactor: delete ElevenLabs TTS, music, usage API endpoints`

---

### Task 5: Strip SFX Generation from sfx.js

Keep GET (serve cached SFX from KV), remove POST (ElevenLabs generation).

**Files:** Modify `functions/api/sfx.js`

**Changes:**

Rewrite to only handle GET requests - serve cached MP3 from KV by name:

```javascript
export async function onRequest(context) {
  var env = context.env;
  var kv = env.BRAINBLITZ_KV;
  var url = new URL(context.request.url);

  if (context.request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  var name = url.searchParams.get('name');
  if (!name) {
    return new Response(JSON.stringify({ error: 'Missing name parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check for status request
  if (url.searchParams.get('status') === 'true') {
    var meta = await kv.get('sfx:meta:' + name, 'json');
    return new Response(JSON.stringify({ name: name, meta: meta }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Serve cached SFX from KV
  var audio = await kv.get('sfx:' + name, 'arrayBuffer');
  if (!audio) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(audio, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=604800'
    }
  });
}
```

**Commit:** `refactor: strip SFX generation, keep GET-only serving from KV`

---

### Task 6: Category Roulette

Add "Roulette 🎰" as a category option. When selected, questions are grouped into blocks and a spinning wheel picks each block's category.

**Files:** Modify `index.html`

**Changes:**

**6a. Add Roulette pill to settings:**

After the "Any" pill (line 2024), add:
```html
<button class="pill" data-val="roulette" onclick="selectPill(this,'cat')">Roulette &#127920;</button>
```

**6b. Add CSS for the roulette wheel overlay:**

```css
.roulette-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  z-index: 15;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.85);
  opacity: 0; pointer-events: none;
  transition: opacity 0.2s ease;
}
.roulette-overlay.show { opacity: 1; pointer-events: all; }
.roulette-wheel {
  width: clamp(280px, 50vw, 450px);
  height: clamp(280px, 50vw, 450px);
  border-radius: 50%;
  border: 4px solid rgba(255,255,255,0.3);
  position: relative;
  transition: transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99);
}
.roulette-pointer {
  position: absolute;
  top: -20px; left: 50%;
  transform: translateX(-50%);
  font-size: 30px;
  z-index: 2;
  filter: drop-shadow(0 0 8px rgba(255,230,0,0.6));
}
.roulette-category-label {
  font-family: 'Orbitron', monospace;
  font-size: clamp(20px, 4vw, 36px);
  color: var(--neon-yellow);
  text-shadow: 0 0 15px rgba(255,230,0,0.5);
  margin-top: 30px;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.roulette-category-label.show { opacity: 1; }
```

**6c. Add roulette HTML overlay (after turn-switch div):**

```html
<div class="roulette-overlay" id="roulette-overlay">
  <div style="text-align:center;">
    <div style="position:relative; display:inline-block;">
      <div class="roulette-pointer">▼</div>
      <canvas class="roulette-wheel" id="roulette-wheel" width="450" height="450"></canvas>
    </div>
    <div class="roulette-category-label" id="roulette-label"></div>
  </div>
</div>
```

Actually, use a canvas for the wheel - it's simpler to draw segments with text. Canvas is well-supported on webOS.

**6d. Add roulette game state variables:**

```javascript
var isRoulette = false;
var rouletteBlockSize = 3;
var rouletteCategories = []; // pre-picked category per block
var currentRouletteBlock = -1;
```

**6e. Modify `startGame()` to detect roulette mode:**

After `settings.category = getSelected('cat')`:
```javascript
isRoulette = settings.category === 'roulette';
if (isRoulette) {
  settings.category = ''; // load ALL questions
}
```

After `selectQuestions()`, if roulette, calculate blocks:
```javascript
if (isRoulette) {
  // Determine block size (3-5 questions per block)
  rouletteBlockSize = questions.length <= 10 ? 3 : (questions.length <= 15 ? 4 : 5);
  // Pre-pick a random category for each block
  var allCats = [];
  for (var i = 0; i < questions.length; i++) {
    if (allCats.indexOf(questions[i].category) === -1) allCats.push(questions[i].category);
  }
  var numBlocks = Math.ceil(questions.length / rouletteBlockSize);
  rouletteCategories = [];
  for (var b = 0; b < numBlocks; b++) {
    rouletteCategories.push(allCats[Math.floor(Math.random() * allCats.length)]);
  }
  currentRouletteBlock = -1;
}
```

**6f. Add `showRouletteWheel(category, callback)` function:**

Draws a canvas wheel with all categories, spins to land on the pre-selected category, then calls callback after animation.

```javascript
function showRouletteWheel(targetCategory, cb) {
  var overlay = document.getElementById('roulette-overlay');
  var canvas = document.getElementById('roulette-wheel');
  var label = document.getElementById('roulette-label');
  var ctx = canvas.getContext('2d');
  var categories = ['Frenchies','Hiking','SA Wines','Paris','Cheeses','Braai Culture',
    '90s Pop Culture','SA Food & Slang','True or False','CT Coffee & Cafes',
    'Cape Winelands','CT Foodie','Cape Adventures'];
  var colors = ['#00f0ff','#ff2d78','#8b5cf6','#fbbf24','#10b981','#f97316',
    '#ec4899','#06b6d4','#84cc16','#a78bfa','#f43f5e','#14b8a6','#eab308'];
  var segAngle = (Math.PI * 2) / categories.length;

  // Find target index
  var targetIdx = 0;
  for (var i = 0; i < categories.length; i++) {
    if (categories[i] === targetCategory) { targetIdx = i; break; }
  }

  // Draw wheel function
  function drawWheel(rotation) {
    ctx.clearRect(0, 0, 450, 450);
    ctx.save();
    ctx.translate(225, 225);
    ctx.rotate(rotation);
    for (var i = 0; i < categories.length; i++) {
      var startAngle = i * segAngle;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 220, startAngle, startAngle + segAngle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Text
      ctx.save();
      ctx.rotate(startAngle + segAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Orbitron, monospace';
      ctx.fillText(categories[i], 200, 4);
      ctx.restore();
    }
    ctx.restore();
  }

  overlay.classList.add('show');
  label.classList.remove('show');
  label.textContent = '';

  // Animate spin: 3 full rotations + land on target
  var targetAngle = -(targetIdx * segAngle + segAngle / 2) + Math.PI / 2; // pointer at top
  var totalSpin = Math.PI * 6 + targetAngle; // 3 full spins + target
  var duration = 3000;
  var startTime = performance.now();

  sfxWhoosh();

  function animate(now) {
    var elapsed = now - startTime;
    var progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    var eased = 1 - Math.pow(1 - progress, 3);
    var currentAngle = totalSpin * eased;
    drawWheel(currentAngle);

    // Tick sound at segment boundaries
    if (progress < 0.85 && elapsed % 120 < 20) {
      sfxTick();
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Show result
      label.textContent = targetCategory;
      label.classList.add('show');
      sfxCorrect();
      setTimeout(function() {
        overlay.classList.remove('show');
        if (cb) cb();
      }, 1200);
    }
  }
  requestAnimationFrame(animate);
}
```

**6g. Modify `advanceAfterAnswer()` / question flow to show roulette at block boundaries:**

In `loadQuestion()` or before it, check if we're at a new roulette block:
```javascript
// At start of loadQuestion, before loading the question:
if (isRoulette) {
  var blockIdx = Math.floor(currentQ / rouletteBlockSize);
  if (blockIdx !== currentRouletteBlock) {
    currentRouletteBlock = blockIdx;
    var cat = rouletteCategories[blockIdx];
    // Re-assign this block's questions to the target category
    // (swap questions from the pool that match this category)
    showRouletteWheel(cat, function() { loadQuestionInner(); });
    return;
  }
}
```

Actually simpler approach: pre-assign categories to questions at game start, then show the wheel at block boundaries. The wheel is purely visual - the category is pre-assigned.

**Commit:** `feat: add Category Roulette mode with spinning wheel`

---

### Task 7: Category-Themed Web Audio Music

Replace the single `game()` music track with category-specific synth loops.

**Files:** Modify `index.html`

**Changes:**

**7a. Add category-to-music mapping:**

```javascript
var CATEGORY_MUSIC = {
  'Frenchies': 'french',
  'Paris': 'french',
  'CT Coffee & Cafes': 'bossa',
  'Cape Winelands': 'classical',
  'SA Wines': 'classical',
  'CT Foodie': 'afrobeat',
  'Braai Culture': 'afrobeat',
  'SA Food & Slang': 'marabi',
  'Cape Adventures': 'ambient',
  'Hiking': 'ambient',
  '90s Pop Culture': 'synthpop',
  'Cheeses': 'jazz',
  'True or False': 'tension'
};
```

**7b. Add new Music track methods for each genre:**

Add these methods to the Music object. Each is a short 4-8 bar synth loop:

- `Music.french()` - Accordion waltz: 3/4 time, musette chords, tremolo
- `Music.bossa()` - Bossa nova: warm Rhodes, gentle syncopation
- `Music.classical()` - Strings: sustained pad, arpeggiated melody
- `Music.afrobeat()` - Upbeat: strong kick pattern, bright chords
- `Music.ambient()` - Pad + light percussion, pentatonic melody
- `Music.marabi()` - Jazz shuffle: walking bass, swing rhythm
- `Music.synthpop()` - 80s synth: saw lead, arpeggiated bass
- `Music.jazz()` - Light pizzicato: plucked strings, swing
- `Music.tension()` - Game-show pulse: minor key, building intensity

Each follows the existing pattern: `this._init(vol)`, `this._startScheduler(callback)`, using `this._kick()`, `this._hihat()`, `this._note()`.

**7c. Modify game music start to use category-themed track:**

In `startGame()`, replace `Music.game()` with:
```javascript
var musicTheme = CATEGORY_MUSIC[settings.category] || 'game';
if (isRoulette) musicTheme = 'game'; // default for roulette (changes per block)
Music[musicTheme] ? Music[musicTheme]() : Music.game();
```

**7d. During roulette, switch music at block boundaries:**

After the roulette wheel reveals the category, start the new category's music:
```javascript
var theme = CATEGORY_MUSIC[cat] || 'game';
Music[theme] ? Music[theme]() : Music.game();
```

**Commit:** `feat: category-themed Web Audio music (9 genre synth loops)`

---

### Task 8: webOS Compat Check + Final Integration

**Files:** Modify `index.html`

**Changes:**

1. Search entire file for `.includes(` - replace with `.indexOf() !== -1`
2. Search for spread syntax `[...` - replace with `[].slice.call()`
3. Search for `?.` optional chaining - replace with explicit checks
4. Search for `??` nullish coalescing - replace with `||` or ternary
5. Search for `inset: 0` - replace with explicit `top:0;left:0;right:0;bottom:0`
6. Verify all new code uses `var` or safe `let`/`const` (no class fields)
7. Verify canvas API calls are webOS-safe

**Commit:** `fix: webOS compatibility pass on new features`
