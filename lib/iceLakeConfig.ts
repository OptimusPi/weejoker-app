/**
 * Remote Parquet "Ice Lake" base URL (browser → HTTPS).
 * Point at ErraticDeck public storage, e.g. https://seeds.erraticdeck.app/parquet_lake
 * (R2 custom domain or Worker — must send CORS + range headers for DuckDB WASM).
 */
export const ICELAKE_BUCKET_URL =
  (typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_ICELAKE_BUCKET_URL?.replace(/\/$/, '')) ||
  'https://r2.weejoker.app/parquet_lake';

/**
 * - weejoker: ranks/little_6s.parquet, suits/little_Hearts.parquet
 * - erraticdeck: ranks/6s.parquet (matches ErraticDeck.app PARQUET_LAKE layout)
 */
export type IceLakePathStyle = 'weejoker' | 'erraticdeck';

export const ICELAKE_PATH_STYLE: IceLakePathStyle =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_ICELAKE_PATH_STYLE === 'erraticdeck'
    ? 'erraticdeck'
    : 'weejoker';

function normalizeErraticRank(rank: string): string {
  return rank.toLowerCase().replace(/\s+/g, '_');
}

/** Build object paths relative to ICELAKE_BUCKET_URL. */
export function buildIceLakePartitions(
  selectedRanks: string[],
  selectedSuits: string[]
): string[] {
  if (ICELAKE_PATH_STYLE === 'erraticdeck') {
    return [
      ...selectedRanks.map(
        (r) => `ranks/${normalizeErraticRank(r)}.parquet`
      ),
      ...selectedSuits.map(
        (s) => `suits/little_${normalizeErraticRank(s)}.parquet`
      ),
    ];
  }
  return [
    ...selectedRanks.map((r) => `ranks/little_${r}.parquet`),
    ...selectedSuits.map((s) => `suits/little_${s}.parquet`),
  ];
}
