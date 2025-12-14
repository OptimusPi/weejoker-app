-- Scores table for Daily Wee
CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seed TEXT NOT NULL,
    day_number INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    submitted_at TEXT DEFAULT (datetime('now'))
);

-- Index for fast day lookups
CREATE INDEX IF NOT EXISTS idx_day ON scores (day_number);
CREATE INDEX IF NOT EXISTS idx_score ON scores (score DESC);
