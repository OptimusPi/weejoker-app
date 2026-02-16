-- Weejoker D1 Schema
-- Apply: npx wrangler d1 migrations apply weejoker-scores

CREATE TABLE IF NOT EXISTS scores (
    ritual_id TEXT NOT NULL,
    seed TEXT NOT NULL,
    player_name TEXT NOT NULL,
    score_display TEXT NOT NULL,
    score_value REAL NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ritual_id, seed, player_name)
);

CREATE TABLE IF NOT EXISTS rituals (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    tagline TEXT DEFAULT '',
    epoch TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
