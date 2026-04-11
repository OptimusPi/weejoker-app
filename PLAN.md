# WeeJoker — Actionable Plan

## Current State (Feb 28, 2026)

**What works:**
- Daily Ritual UI renders at `seed-finder-app.optimuspi.workers.dev`
- DailyRitual.tsx → fetches `/api/rituals/TheDailyWee` → gets seed + JAML from R2
- RitualChallengeBoard.tsx → two-view system (preview with arrows / detail with tabs)
- JAML evaluation pipeline → foundJokers/foundConsumables rendered as Sprites
- Score submission + leaderboard via D1
- Cartridge animations (fall out bottom / rise from bottom)
- Card panel locked to 320×340px, arrows outside

**What's broken / incomplete:**
- WASM `_framework` files deleted from `public/` (35MB) — `useSeedAnalyzer` fails in prod
- `DailyWee.tsx` (legacy) still imported by some paths — should be retired
- `/api/rituals/[id]/seeds/[day]` is a stub
- `js-yaml` is types-only dep but imported at runtime in `RitualObjectives.tsx`
- `tesseract.js` in deps but unused
- Ice Lake (DuckDB + R2 Parquet) has no user-facing route

---

## Phase 1: Fix What's Broken (IMMEDIATE)

### 1.1 Host WASM `_framework` on R2
- **Why**: motely-wasm needs ~60MB of .wasm/.dll/.js files to run
- **Action**: Upload `node_modules/motely-wasm/_framework/` to R2 bucket `seeds-1` under `_framework/`
- **Action**: Update `lib/api/motelyWasm.ts` `loadMotely()` to use `baseUrl: 'https://seeds-1.r2.dev/_framework'`
- **Action**: Set `Cache-Control: public, max-age=31536000, immutable` on R2 objects
- **Verify**: `useSeedAnalyzer("ABCD1234")` returns analysis data in prod

### 1.2 Fix `js-yaml` Runtime Import
- **Action**: Add `js-yaml` to `dependencies` (not just devDependencies), OR
- **Action**: Replace `js-yaml` usage in `RitualObjectives.tsx` with the existing JAML parser

### 1.3 Remove Unused Dependencies
- **Action**: Remove `tesseract.js` from package.json (unused)
- **Action**: Remove one-off scripts from repo root (convert_seeds.ps1, fix_csv_encoding.ps1, test.js, convert-csv*.js, convert-final.js)

---

## Phase 2: UI Polish (THIS WEEK)

### 2.1 Preview Card — Top Row Redesign
- **Target**: 320px wide, two halves
  - **Left 50%**: `SEED` text + copy icon (tap to copy)
  - **Right 50%**: Erratic deck back + stake sticker (rotated ~12°), stacked with PlayingCard showing featured rank|suit from JAML
- **Rules**:
  - DeckSprite and PlayingCard must be same visual size (size={40})
  - Rank comes from `startingDeck[]` most-common rank (Balatro order: 2,3...K,A)
  - Suit comes from `startingDeck[]` most-common suit
  - If no startingDeck (legacy data), show deck back only

### 2.2 Detail View — Tab Content
- **Details tab**: Objectives pills, Key Jokers (Sprite array), Key Consumables (Sprite array), Starting Deck
- **Strategy tab**: JamlJourneyMap (per-ante item timeline)
- **Scores tab**: LeaderboardComponent (fetches from `/api/scores`)

### 2.3 Day Navigation
- Cartridge animation: card falls to `100vh`, new card rises from `100vh` ✅ DONE
- Arrows flush with screen edges, panel centered between them ✅ DONE

---

## Phase 3: Data Pipeline (NEXT WEEK)

### 3.1 R2 Storage Layout
```
seeds-1/                          ← R2 bucket
├── TheDailyWee.csv               ← 365 curated seeds (one per day)
├── TheDailyWee.jaml              ← JAML filter definition
├── _framework/                   ← motely-wasm runtime files
│   ├── dotnet.js
│   ├── dotnet.native.wasm
│   └── ... (~90 files)
└── parquet_lake/                 ← Ice Lake data
    ├── seeds_rank_2.parquet
    ├── seeds_rank_3.parquet
    └── ...
```

### 3.2 D1 Schema (Current)
```sql
-- Scores
CREATE TABLE scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ritual_id TEXT NOT NULL,
  seed TEXT NOT NULL,
  player_name TEXT NOT NULL,
  score_display TEXT,
  score_value INTEGER NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ritual_id, seed, player_name)
);

-- Ritual metadata
CREATE TABLE rituals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT,
  epoch TEXT NOT NULL
);
```

### 3.3 Score Submission Flow
```
User taps "Submit Score" → SubmitScoreModal.tsx
  → POST /api/scores { seed, ritualId, playerName, score }
  → Edge API validates: seed === today's seed (from R2 CSV + epoch calc)
  → INSERT OR REPLACE into D1 scores table
  → Return success/error
```

### 3.4 Score Reading Flow
```
RitualChallengeBoard Scores tab → LeaderboardComponent
  → GET /api/scores?seed=ABCD1234&ritualId=TheDailyWee
  → Edge API reads D1: SELECT * FROM scores WHERE ritual_id=? AND seed=? ORDER BY score_value DESC LIMIT 10
  → Return top 10 scores
```

---

## Phase 4: Dead Code Cleanup

### Remove Legacy Components
| File | Action |
|------|--------|
| `components/DailyWee.tsx` | Delete — superseded by `DailyRitual.tsx` |
| `components/Explorer.tsx` | Delete — no route uses it |
| `components/Leaderboard.tsx` | Delete — superseded by `LeaderboardComponent.tsx` |
| `components/SeedScatterPlot.tsx` | Delete — not imported anywhere |
| `components/DuckDBProvider.tsx` | Keep — needed for Ice Lake (Phase 5) |
| `components/SeedExplorer.tsx` | Keep — Ice Lake UI (Phase 5) |
| `lib/api/motelyApi.ts` | Delete — REST API fully replaced by WASM |
| `schema.sql` | Delete — superseded by `migrations/0001_init.sql` |
| `components/ClientDailyWeeLoader.tsx` | Delete — not imported |
| `components/vfx/SwirlBackground.tsx` | Delete — not imported, BackgroundShader.tsx is used |

### Remove Root Junk
- `convert_seeds.ps1`, `fix_csv_encoding.ps1`, `convert-csv.js`, `convert-csv-strict.js`, `convert-final.js`, `test.js`, `curated_seeds.csv`, `curated_import.sql`

### Consolidate Duplicate Routes
- `/jaml-builder` and `/jaml-uiv2` both render `JamlUIV2` → keep only `/jaml-builder`

---

## Phase 5: Ice Lake (FUTURE)

### Goal
Let users explore the full seed space via DuckDB WASM querying Parquet files on R2.

### Architecture
```
R2: parquet_lake/seeds_rank_{rank}.parquet
  → DuckDB WASM (client-side, in-browser)
  → SQL queries via HTTP range requests (no download needed)
  → useIceLakeScanner hook → streams matching seeds
  → Optional: openSingleSeedContext per match for full details
```

### Route
- Add `/explore` page rendering `SeedExplorer.tsx`
- Wrap in `DuckDBProvider`
- Let users filter by rank, suit, joker presence
- Show results as scrollable `AgnosticSeedCard` list

---

## Phase 6: Community Rituals (FUTURE)

### Goal
Let users create and share their own daily rituals with custom JAML filters.

### Flow
```
/create page (exists) → 4-step wizard
  1. Name + description
  2. Write JAML filter
  3. Search seeds (WASM) → select top N
  4. Submit → POST /api/rituals/create → R2 + D1
```

### Then
- `/we` page lists community rituals
- `/{ritualId}` renders any ritual via `DailyRitual.tsx`

---

## Priority Order

1. **Phase 1** — Fix WASM hosting (blocks seed analysis in prod)
2. **Phase 2** — UI polish (user-facing quality)
3. **Phase 4** — Dead code cleanup (reduce confusion)
4. **Phase 3** — Data pipeline docs (operational clarity)
5. **Phase 5** — Ice Lake exploration (new feature)
6. **Phase 6** — Community rituals (growth feature)
