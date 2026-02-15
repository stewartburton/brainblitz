# 🧠 BRAINBLITZ — Lekker TV Trivia

A Triviaverse-inspired trivia game show built for LG webOS TVs (and any browser). Features South African Afrikaans expressions throughout for that local flavour.

![Built for TV](https://img.shields.io/badge/Built%20For-LG%20webOS%20TV-ff2d78?style=flat-square)
![HTML5](https://img.shields.io/badge/HTML5-Single%20File-00f0ff?style=flat-square)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-00ff88?style=flat-square)

## Features

- **Game show UI** — Neon-styled, large text optimised for TV viewing distance
- **Magic Remote compatible** — Point and click with the LG remote
- **Keyboard support** — Press A/B/C/D to answer (pair a Bluetooth keyboard)
- **Speed scoring** — Faster answers earn more points
- **Streak multiplier** — 3+ correct in a row gives bonus points
- **Sound effects** — Web Audio API synth sounds, no files needed
- **Configurable** — Difficulty, timer, categories, and round count
- **SA Expressions** — Lekker Afrikaans feedback like "Ja Boet!", "Kwaai!", "Eina!", and "Haibo!"
- **Fresh questions** — Pulls from the Open Trivia Database API

## How to Play on Your LG TV

### Option A: Host from your PC (Local Network)

1. Clone this repo or download `brainblitz.html`
2. Serve it locally:
   ```bash
   # Python
   python -m http.server 8080

   # Or Node.js
   npx serve .
   ```
3. Find your PC's local IP (e.g. `192.168.1.100`)
4. On your LG TV, open the **Web Browser** app
5. Navigate to `http://192.168.1.100:8080/brainblitz.html`
6. Bookmark it for quick access!

### Option B: Host on Cloudflare Pages (Public URL)

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect this GitHub repo or drag-and-drop `brainblitz.html`
3. Deploy — you'll get a URL like `brainblitz.pages.dev`
4. Open that URL in your TV browser

## TV Compatibility

Tested/designed for:
- **LG UN73 Series (2020)** running webOS TV
- Should work on any LG webOS TV with a web browser (2018+)
- Also works in any modern desktop/mobile browser

## Requirements

- Internet connection (questions are fetched from [Open Trivia Database](https://opentdb.com))
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

Zero dependencies. Single HTML file containing:
- HTML5
- CSS3 (custom properties, grid, animations)
- Vanilla JavaScript
- Web Audio API (synthesised sound effects)
- [Open Trivia Database API](https://opentdb.com/api_config.php)
- Google Fonts (Orbitron + Rajdhani)

## License

MIT
