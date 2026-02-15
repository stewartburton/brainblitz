# 🧠 BRAINBLITZ — Lekker TV Trivia

A Triviaverse-inspired two-player trivia game show built for LG webOS TVs (and any browser). Burden vs Stu — who's the Boss? Features South African Afrikaans expressions throughout for that local flavour.

![Built for TV](https://img.shields.io/badge/Built%20For-LG%20webOS%20TV-ff2d78?style=flat-square)
![HTML5](https://img.shields.io/badge/HTML5-Single%20File-00f0ff?style=flat-square)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-00ff88?style=flat-square)

## Features

- **Two-player game** — Burden vs Stu, alternating turns
- **Game show UI** — Neon-styled, large text optimised for TV viewing distance
- **Magic Remote + Arrow Keys** — Full LG remote navigation support
- **Keyboard support** — Press A/B/C/D to answer (pair a Bluetooth keyboard)
- **Speed scoring** — Faster answers earn more points
- **Streak multiplier** — 3+ correct in a row gives bonus points
- **Winner celebration** — Confetti, trophy animation, and victory fanfare
- **Sound effects** — Web Audio API synth sounds, no files needed
- **Configurable** — Timer, categories, rounds, and voice selection
- **Voice mode** — Two ElevenLabs voices (Rachel & Butcher) read questions aloud
- **Synth music** — Web Audio API step sequencer with mute toggle
- **Leaderboard** — Lifetime stats persisted via Cloudflare KV
- **SA Expressions** — Lekker Afrikaans feedback like "Ja Boet!", "Kwaai!", "Eina!", and "Haibo!"
- **Custom categories** — Frenchies, Hiking, SA Wines, Paris, Cheeses (125 built-in questions)

## How to Play on Your LG TV

### Option A: Host from your PC (Local Network)

1. Clone this repo or download `index.html`
2. Serve it locally:
   ```bash
   # Python
   python -m http.server 8080

   # Or Node.js
   npx serve .
   ```
3. Find your PC's local IP (e.g. `192.168.1.100`)
4. On your LG TV, open the **Web Browser** app
5. Navigate to `http://192.168.1.100:8080/`
6. Bookmark it for quick access!

> Note: Score persistence and TTS require Cloudflare Pages deployment.

### Option B: Deploy to Cloudflare Pages (Recommended)

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect this GitHub repo
3. Deploy — you'll get a URL like `brainblitz.pages.dev`
4. Open that URL in your TV browser

#### Setting up Cloudflare KV (Score Persistence)

1. In your Cloudflare dashboard, go to **Workers & Pages > KV**
2. Create a new KV namespace called `BRAINBLITZ_KV`
3. Go to your Pages project > **Settings > Functions > KV namespace bindings**
4. Add binding: Variable name = `BRAINBLITZ_KV`, KV namespace = the one you created
5. Redeploy — scores will now persist!

#### Setting up ElevenLabs TTS (Optional Voice)

1. Create an [ElevenLabs](https://elevenlabs.io) account (free tier: 10,000 chars/month)
2. Create a restricted API key with **Text to Speech → Access** permission
3. In Cloudflare Pages > **Settings > Environment variables**
4. Add: `ELEVENLABS_API_KEY` = your API key
5. Redeploy — choose "Rachel" or "Butcher" voice in game settings to hear questions read aloud

## File Structure

```
brainblitz/
├── index.html              # The entire game (HTML + CSS + JS)
├── functions/
│   └── api/
│       ├── _middleware.js   # CORS headers for API routes
│       ├── scores.js        # GET/POST player stats (Cloudflare KV)
│       └── tts.js           # ElevenLabs TTS proxy
├── CHANGELOG.md
└── README.md
```

## TV Compatibility

Tested/designed for:
- **LG UN73 Series (2020)** running webOS TV
- Should work on any LG webOS TV with a web browser (2018+)
- Also works in any modern desktop/mobile browser

## Requirements

- Internet connection (for score persistence and TTS; questions are built-in)
- LG Magic Remote recommended (pointer-based interaction)

## South African Expressions Used

| Expression | Meaning |
|---|---|
| Lekker! | Great / Awesome |
| Ja Boet! | Yes Bro! |
| Kwaai! | Cool / Sick |
| Eina! | Ouch! |
| Haibo! | Wow / No way! |
| Ag Nee! | Oh No! |
| Aikona! | No way / Absolutely not |
| Sharp Sharp! | Cool / All good |
| Jy's 'n Bees! | You're a beast! |
| Baie Mooi! | Very nice! |
| Nou Gaan Ons Braai! | Now we're cooking! (lit. Now we braai!) |
| Huis Toe | Home (going home) |

## Tech Stack

Single HTML file + Cloudflare Pages Functions:
- HTML5
- CSS3 (custom properties, grid, animations, confetti)
- Vanilla JavaScript
- Web Audio API (synthesised sound effects + step sequencer music)
- [ElevenLabs TTS API](https://elevenlabs.io) (optional voice)
- Cloudflare KV (score persistence)
- Google Fonts (Orbitron + Rajdhani)

## License

MIT
