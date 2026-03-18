# Ice Lake — Erratic Deck Seed Explorer

## What Is This

The Erratic deck randomizes every card's rank AND suit independently.
Of 2.3 trillion erratic seeds, only ~0.5% are "interesting" — those where
a rank or suit appears unusually many times in the 52-card starting deck.

E.g. a seed with 14 Aces or 20 Hearts is interesting because it enables
wild scoring strategies that a normal deck can't.

Ice Lake lets users explore this top-0.5% via DuckDB WASM querying
pre-sorted Parquet files on R2 via HTTP range requests — no server needed.

---

## Parquet Schema (target)

```
erratic_top.parquet
  seed       VARCHAR(8)  — e.g. "PERKEO2X"
  max_rank   UINT8       — highest count of any single rank (0–52)
  max_suit   UINT8       — highest count of any single suit (0–52)
  aces       UINT8       — count of Aces in the 52-card deck
  kings      UINT8
  queens     UINT8
  jacks      UINT8
  tens       UINT8
  nines      UINT8
  eights     UINT8
  sevens     UINT8
  sixes      UINT8
  fives      UINT8
  fours      UINT8
  threes     UINT8
  twos       UINT8
  hearts     UINT8       — count of Hearts
  diamonds   UINT8
  clubs      UINT8
  spades     UINT8
```

**Row ordering:** `ORDER BY max_rank DESC, max_suit DESC` — DuckDB row group
statistics can then skip entire groups that don't meet a WHERE threshold.

**Row groups:** 131,072 rows/group (DuckDB default). With ZSTD compression
the full ~12B interesting seeds should compress to manageable size.

---

## Generating the Parquet

### Option A: Via JAML search + Motely CLI (rank-partitioned)
```bash
# Find all erratic seeds with 10+ Aces
Motely --jaml erratic_aces10.jaml --deck Erratic --sink MotelyData/sinks/aces10.parquet

# erratic_aces10.jaml:
# deck: Erratic
# must:
#   - erraticRank: Ace
#     min: 10
```

This produces a simple `(seed, score)` Parquet. Then convert to
the full schema with a DuckDB transform (see Option B).

### Option B: Via DuckDB from existing sorted CSV
```sql
-- If you have seeds_sorted.csv with columns: seed, ace_count, king_count, ..., hearts_count, ...
COPY (
  SELECT
    seed,
    GREATEST(ace_count, king_count, ...) AS max_rank,
    GREATEST(hearts_count, ...) AS max_suit,
    ace_count AS aces,
    king_count AS kings,
    -- ...
    hearts_count AS hearts,
    -- ...
  FROM read_csv('seeds_sorted.csv')
  ORDER BY max_rank DESC, max_suit DESC
) TO 'erratic_top.parquet' (FORMAT PARQUET, CODEC 'ZSTD');
```

### Option C: Via Motely.CLI with a custom JAML that scores rank/suit counts
```bash
# Use should: clauses to score based on rank duplication
# Then sort by score DESC and sink to Parquet
Motely --jaml erratic_rank_score.jaml --deck Erratic --cutoff 8 --sink erratic_top.parquet
```

---

## R2 CORS (for DuckDB WASM)

DuckDB WASM fetches Parquet via HTTP GET/HEAD with `Range` headers. R2 must return CORS headers.

Apply CORS to `seeds-1`:

```bash
pnpm wrangler r2 bucket cors set seeds-1 --file wrangler/r2-cors-duckdb.json -y
```

Config lives in `wrangler/r2-cors-duckdb.json`. Ensures `GET`, `HEAD`, `Range`, and exposes `Content-Range`, `Accept-Ranges`, `Content-Length`, `ETag` for efficient Parquet range reads.

---

## R2 Upload

```bash
# Using wrangler
wrangler r2 object put seeds-1/parquet_lake/erratic_top.parquet \
  --file erratic_top.parquet \
  --cache-control "public, max-age=86400"

# Or partition by rank (current SeedExplorer approach):
wrangler r2 object put seeds-1/parquet_lake/ranks/Aces.parquet --file aces.parquet
wrangler r2 object put seeds-1/parquet_lake/suits/Hearts.parquet --file hearts.parquet
# etc...
```

---

## SeedExplorer Query Examples (DuckDB WASM)

```sql
-- Seeds with 12+ Aces
SELECT seed FROM 'erratic_top.parquet' WHERE aces >= 12 ORDER BY aces DESC LIMIT 200

-- Seeds with 15+ Hearts OR 15+ Spades  
SELECT seed FROM 'erratic_top.parquet' WHERE hearts >= 15 OR spades >= 15 ORDER BY max_suit DESC LIMIT 200

-- Seeds with lots of both a rank AND suit
SELECT seed FROM 'erratic_top.parquet' WHERE aces >= 8 AND hearts >= 10 LIMIT 100
```

---

## Current State

- `/explore` page → `DuckDBProvider` + `SeedExplorer` (partition mode)
- `SeedExplorer` queries `https://r2.weejoker.app/parquet_lake/ranks/{rank}.parquet`
- **Missing**: the actual Parquet files on R2 (need to generate + upload)
- **Missing**: column-mode support in SeedExplorer (WHERE aces >= N)

## Community Helpers (Read-Only Ice Lake)

C# MotelyWorkers and other server-side helpers can read Ice Lake Parquet **without DuckDB WASM**:

- **Option A — HTTP + Parquet library**: Fetch `https://r2.weejoker.app/parquet_lake/ranks/Aces.parquet` (or `erratic_top.parquet`) via `HttpClient`, then use `Parquet.Net` or `Apache.Arrow` to read rows. Good for pulling batches of seeds to process.
- **Option B — Proxy API**: Add a route on wEEjOKER or JAMMY (e.g. `GET /api/ice-lake?where=aces>=10&limit=200`) that runs DuckDB server-side (Node) or a Parquet reader, and returns JSON. Helpers call this API. Keeps Parquet logic centralized.
- **Option C — DuckDB native**: Use DuckDB's .NET binding with `SELECT * FROM 'https://r2.weejoker.app/parquet_lake/erratic_top.parquet' WHERE aces >= 10 LIMIT 200` — works from C# without browser CORS; only needs the Parquet files to be publicly reachable.

---

## Next Steps

1. Generate Parquet files using one of the options above
2. Upload to R2 at `seeds-1/parquet_lake/`
3. Apply R2 CORS: `pnpm wrangler r2 bucket cors set seeds-1 --file wrangler/r2-cors-duckdb.json -y`
4. Update SeedExplorer to support column-based queries (WHERE aces >= N slider)
