# Cloudflare R2 "Ice Lake" Architecture Guide

## How It Works (The "Magic")

You asked: *"Does my data live on only one server... or worldwide?"*

The answer is **BOTH**. This is the power of the "Ice Lake" pattern.

### 1. Storage (The "Ice")
*   **Where:** Your data lives physically in **one region** (e.g., North America).
*   **Cost:** You pay to store it here. It's cheap because it's just "sitting on ice."
*   **Immutability:** Since these seed files (2s.parquet, Hearts.parquet) never change, they are perfect candidates for aggressive caching.

### 2. Delivery (The "Flow")
*   **Global CDN:** Cloudflare puts its global network *in front* of your R2 bucket.
*   **The First Request:**
    *   User in London asks for `Hearts.parquet`.
    *   Cloudflare sees it's not in the London cache.
    *   It fetches it from your R2 bucket in USA (takes ~200ms).
    *   It **saves a copy** in London.
*   **The Next Request:**
    *   Another user in London (or you, refreshing the page) asks for `Hearts.parquet`.
    *   Cloudflare serves it instantly from the London cache (takes ~20ms).
    *   **Zero Egress Fees:** R2 charges $0 for this bandwidth.

### 3. The "Smart" Part (Range Requests)
*   Parquet files are special. They have a "header" at the end that tells the reader where data is.
*   **DuckDB WASM** (running in the user's browser) doesn't download the whole 50MB file.
*   It sends a `Range: bytes=...` request to fetch *just* the metadata.
*   Then it sends another request for *just* the column it needs (e.g., "Score").
*   **Result:** Even if the file is huge, the browser only downloads a few kilobytes to answer a simple query.

## Optimization Checklist

To make this fly, follow these rules when uploading to R2:

### 1. Set Cache Headers (Crucial!)
When you upload your parquet files, you must tell Cloudflare "This file never changes."
If you use the dashboard or CLI, set metadata:
*   `Cache-Control: public, max-age=31536000, immutable`
*   This tells the CDN: "Keep this in cache for 1 year. It won't change."

### 2. Partitioning
*   **Do:** `suits/Hearts.parquet` (Good! ~100MB)
*   **Don't:** `all_seeds.parquet` (Bad! 2GB)
*   **Why:** Even with Range requests, smaller files are easier for the CDN to manage and cache efficiently.

### 3. Compression
*   Your script uses `CODEC 'ZSTD'`.
*   This is the best balance of size vs. speed for this data. Keep it.

## Diagram

[User Browser (DuckDB)] 
       ⬇️ (SQL Query)
[Cloudflare Edge (London)] ⚡️ HIT! (Fast)
       ⬇️ (MISS? Fetch once)
[R2 Storage (USA)] 🧊 (Source of Truth)
