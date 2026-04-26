# WeeJoker.app — "The Daily Wee"

## What This Is

A **daily ritual game** (think Wordle, but for Balatro seeds). Each day presents a curated seed from the "Erratic Deck" — players analyze it, plan a strategy, play it in Balatro, then submit their score to the leaderboard.

**Live**: <https://seed-finder-app.optimuspi.workers.dev>
**Repo**: github.com/OptimusPi/weejoker-app

## Sibling Project

- **ErraticDeck.app** (`X:/ErraticDeck.app/`) — hosts the Parquet Lake data at seeds.erraticdeck.app

## Tech Stack

- **Next.js 15** (App Router, React 19) on **Cloudflare Workers** via **@opennextjs/cloudflare**
- **Cloudflare D1** — scores + ritual metadata (SQLite at edge)
- **Cloudflare R2** — seed CSVs, JAML filters, WASM runtime files (bucket: `seeds-1`)
- **motely-wasm** (currently v3.15.27, latest is v5.1.43) — Balatro seed analysis in browser
- **motely-node** (v3.15.27) — server-side seed analysis
- **@duckdb/duckdb-wasm** (v1.32.0) — client-side Parquet querying for Ice Lake/Explorer
- **Tailwind CSS** + **Mantine UI** + **Framer Motion**
- **Three.js** (@react-three/fiber) — 3D card effects
- **Zustand** — state management
- **wrangler** — Cloudflare dev/deploy tooling

## Commands

```bash
npm run dev        # Next.js dev server (port 3000)
npm run build      # production build
npm run deploy     # OpenNext build + Cloudflare deploy
npm run preview    # OpenNext build + local preview
npm run cf-typegen # regenerate Cloudflare env types
```

## Architecture

```
app/
  page.tsx              # home — renders DailyRitual
  [ritual]/page.tsx     # dynamic ritual routes
  api/                  # edge API routes (scores, rituals, seeds)
  explore/              # Ice Lake seed explorer (DuckDB + Parquet)
  jaml-builder/         # JAML filter editor
  create/               # community ritual creation wizard
  we/                   # community rituals listing

components/
  DailyRitual.tsx       # main daily game component
  RitualChallengeBoard.tsx  # two-view: preview (arrows) / detail (tabs)
  DuckDBProvider.tsx    # DuckDB-WASM context provider
  SeedExplorer.tsx      # Ice Lake UI
  Sprite.tsx            # Balatro sprite renderer
  DeckSprite.tsx        # deck back sprites
  Standardcard.tsx       # card face renderer

lib/
  motelyWasm.ts         # motely-wasm loader + API wrapper
  duckdb.ts             # DuckDB-WASM initialization
  seedAnalyzer.ts       # seed analysis orchestration
  jaml/                 # JAML parser + evaluation
  api/                  # API route helpers
  hooks/                # React hooks (useSeedAnalyzer, etc.)
```

## Cloudflare Bindings (wrangler.toml)

- `DB` — D1 database `weejoker-scores`
- `SEED_ASSETS` — R2 bucket `seeds-1`
- `AI` — Cloudflare AI (remote)

## Data Flow

1. Daily seed comes from R2 CSV (`TheDailyWee.csv`) + epoch calculation
2. JAML filter from R2 (`TheDailyWee.jaml`) defines what makes seeds interesting
3. motely-wasm analyzes seed client-side → jokers, consumables, deck composition
4. Player submits score → D1 leaderboard
5. Ice Lake: DuckDB-WASM queries Parquet on `seeds.erraticdeck.app` for exploration

## Parquet Lake Integration

```
https://seeds.erraticdeck.app/parquet_lake/ranks/little_6s.parquet  # small sample
https://seeds.erraticdeck.app/parquet_lake/ranks/6s.parquet          # full (~900MB)
```

Ranks: Aces, Kings, Queens, Jacks, 10s, 9s, 8s, 7s, 6s, 5s, 4s, 3s, 2s

## Known Issues (from PLAN.md)

- motely-wasm needs updating from v3.15.27 → v5.1.43
- WASM `_framework` files not in prod (too large for worker assets, need R2 hosting)
- Some legacy dead code remains (DailyWee.tsx, Explorer.tsx, etc.)
- `js-yaml` types-only dep but imported at runtime

## Key Conventions

- WASM runtime files hosted on R2 (exceed 25MB Cloudflare worker limit)
- COOP/COEP headers required for SharedArrayBuffer (WASM threading)
- Card panel locked to 320x340px with arrows outside
- Cartridge animations: fall out bottom / rise from bottom on day change
