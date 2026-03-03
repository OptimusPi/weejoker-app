# Copilot Instructions — WeeJoker App

## Project Overview

**WeeJoker** is a daily curated **Balatro** seed ritual app. Players get one new seed per day, analyze it, play it, and submit high scores. Think "Wordle for Balatro."

## Stack

- **Framework**: Next.js 15.1.11, React 19, TypeScript (strict)
- **Deploy**: Cloudflare Workers via `@opennextjs/cloudflare` (OpenNext)
- **Styling**: Tailwind CSS + custom Balatro-themed CSS variables (globals.css)
- **Fonts**: `m6x11plusplus` (pixel), `Outfit` (sans), `JetBrains Mono` (mono)
- **WASM**: `motely-wasm@1.2.8` — C# compiled to WASM for Balatro seed analysis
- **DuckDB WASM**: Client-side Parquet queries against R2 "Ice Lake" data lake
- **UI Lib**: Mantine 8 (used in JAML editor areas only)

## Cloudflare Bindings

| Binding | Type | Name | Purpose |
|---------|------|------|---------|
| `env.DB` | D1 | `weejoker-scores` | Scores + ritual metadata |
| `env.SEED_ASSETS` | R2 | `seeds-1` | Seed CSVs, JAML filters, Parquet lake |
| `env.AI` | Workers AI | — | Llama-2 wisdom quotes |

## Key Conventions

### Design
- **Mobile-first, iPhone SE (375×667) is the primary target**
- Fixed card dimensions: 320×340px for the preview/detail card
- Never make the UI wider than 375px on mobile
- Use `balatro-panel`, `balatro-button`, `balatro-button-red/blue/green` CSS classes
- All sprites rendered via `<Sprite name="..." width={N} />` component
- Playing cards via `<PlayingCard rank="..." suit="..." size={N} />`
- Deck backs via `<DeckSprite deck="erratic" stake="white" size={N} />`

### Animations
- Day navigation uses "cartridge" animations — card falls off screen bottom, new card rises from bottom
- `animate-cartridge-out` (falls to 100vh) and `animate-cartridge-in` (rises from 100vh)
- Use `juice-pop` animation class for entrance effects

### JAML (Joker Analysis Markup Language)
- Custom YAML-like DSL for defining seed search filters
- Three clause types: `must:` (all required), `should:` (scored), `must_not:` (excluded)
- Each clause has: `type`, `value`, `ante`, `source`, optionally `rank`, `suit`, `edition`, `seal`
- Evaluated client-side via `lib/jaml/jamlEvaluator.ts`
- Validated/searched via motely-wasm (`validateJamlWasm`, `searchSeedsWasm`)
- Filter hook: `useJamlFilter(jamlConfigString)`

### Data Flow: Daily Ritual
```
R2: {ritualId}.csv + {ritualId}.jaml
  → GET /api/rituals/{id}?day=N
  → DailyRitual.tsx (orchestrator)
  → useSeedAnalyzer(seed) → analyzeSeedWasm → normalizeAnalysis
  → evaluateSeed(analysis, filter) → matches
  → RitualChallengeBoard.tsx (renders card)
```

### Balatro Game Knowledge
- **Ranks**: `[2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A]` — Ace is LAST, not first
- **Suits**: `[Spades, Hearts, Clubs, Diamonds]`
- **Deck format**: `"2_C"` = 2 of Clubs, `"A_H"` = Ace of Hearts
- **Erratic Deck**: Randomized rank distribution (not standard 4-of-each)
- **Antes**: Game progresses through Ante 1→8. Items appear in specific antes.
- **Key items**: Jokers (150+), Tarots, Spectrals, Planets, Vouchers, Tags, Boss Blinds

### File Organization
- `components/` — React components (all client-side "use client")
- `lib/` — Utilities, types, hooks, JAML engine, WASM bridge
- `lib/api/motelyWasm.ts` — Singleton WASM bridge (lazy-loaded, threading)
- `lib/hooks/` — React hooks (useSeedAnalyzer, useJamlFilter, ice-lake)
- `lib/jaml/` — JAML parser, evaluator, presets, completion
- `lib/const.ts` — All Balatro game data (jokers, tarots, vouchers, etc.)
- `app/api/` — Edge API routes (Cloudflare Workers)
- `Assets/` — Source sprite sheets
- `public/assets/` — Served sprite sheets

### Active vs Legacy Components
| Active | Legacy (do not extend) |
|--------|----------------------|
| `DailyRitual.tsx` | `DailyWee.tsx` |
| `RitualChallengeBoard.tsx` | `Explorer.tsx` |
| `LeaderboardModal.tsx` / `LeaderboardComponent.tsx` | `Leaderboard.tsx` |
| `JamlUIV2.tsx` | `JamlBuilder.tsx` (old) |
| `lib/api/motelyWasm.ts` | `lib/api/motelyApi.ts` (REST, unused) |

### Commands
```bash
npm run dev          # Local dev server
npm run build        # Next.js production build
npm run deploy       # Build + deploy to Cloudflare Workers
npm run preview      # Build + local Cloudflare preview
```

### API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/rituals/[id]` | GET | Fetch ritual config + today's seed + JAML |
| `/api/scores` | GET | Top 10 scores for seed, or weekly winners |
| `/api/scores` | POST | Submit score (today's seed only) |
| `/api/analyze/[seed]` | GET | WASM seed analysis (cached 1 day) |
| `/api/rituals/create` | POST | Create new ritual (R2 + D1) |

### Important Types (lib/types.ts)
- `SeedData` — Generic seed with dynamic JAML fields + `[key: string]: any`
- `AnalyzedSeed` — Normalized WASM output (deck, antes, items per ante)
- `JamlFilter` — Parsed JAML with must/should/mustNot clause arrays
- `RelevantEvent` — Rich event data (ante, source, type, id, edition, seal)
- `JamzSeedData` — Full seed data including startingDeck[] and relevantEvents[]

### Sprite Rendering
- `getSpriteData(name)` in `lib/SpriteMapper.ts` — maps any item name to sprite position
- Sprite sheets at `public/assets/`: Jokers.png, Tarots.png, Vouchers.png, etc.
- `<Sprite name="weejoker" width={71} />` renders from correct sheet
- Joker names in `lib/const.ts` `Jokers` array (150+ entries with positions)

### WASM Threading
- Requires COOP/COEP headers (`same-origin` / `require-corp`) for SharedArrayBuffer
- Set in `next.config.mjs` headers config
- `motely-wasm` uses `navigator.hardwareConcurrency - 1` threads for search
