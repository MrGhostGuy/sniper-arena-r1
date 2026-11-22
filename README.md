# Sniper Arena — R1 Edition

A compact, native-feeling sniper game built for the Rabbit R1's 240×282 creation-code screen. Inspired by the Roblox game **Sniper Arena**, with authentic rifle names, case series, rarity tiers, and a deep cosmetic collection — including rare EXOTIC finishes.

## Play

- **Scroll wheel / arrow keys / R1 scroll** — switch aiming lane (1–4)
- **Side button / Enter / click** — fire
- **Long press / Esc / Backspace** — back
- **M** — mute

## Systems

- **8 rifles** to unlock with Gold: SSG08 → AWP → M82A1 → M200 → Kar98k → WA 2000 → NTW 20 → DSR-1. Higher tiers give wider hit windows, less sway, faster reloads, and higher Credit payouts.
- **90-second matches** against 3 randomly selected AI opponent archetypes (TWITCH, CAMP, MARK, GHOST, RUSH). Enemies move across 4 lanes, occasionally peek from cover, and shoot back.
- **3 currencies**: Credits (cases), Gold (rifles), CASH (market sales).
- **7 cases**: Strike, Release, Dream, Secret, Lumen, Neon Core, Easter — with the real case series names and boosted rare odds on limited cases.
- **30 cosmetics** across 6 rarities: Common, Rare, Epic, Legendary, Mystic, and **Exotic**. Each has its own animated procedural finish (gradient, stripe, glow, flame, starfield, rainbow, RGB).
- **Market** to sell skins for CASH, **career stats**, and a **daily 10-headshot bonus** (+500 Credits).
- Saves locally in `localStorage`.

## Design notes

Everything is rendered on a single `<canvas>` with no dependencies. The game listens for the R1's native `scrollUp`, `scrollDown`, `sideClick`, and `longPressStart` events, with desktop fallbacks.

## Deployment

Static site — `index.html`, `style.css`, `app.js`, `icon.png`, `.nojekyll`, and `.github/workflows/pages.yml`. Pushes to `main` deploy via GitHub Pages Actions.

Live: https://mrghostguy.github.io/sniper-arena-r1/
