-- SuiPlace Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Create pixels table
CREATE TABLE IF NOT EXISTS pixels (
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    color SMALLINT NOT NULL DEFAULT 0,
    last_painter TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (x, y)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_pixels_updated ON pixels(updated_at);

-- Enable RLS
ALTER TABLE pixels ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON pixels
    FOR SELECT USING (true);

-- Allow all operations for service role (indexer)
CREATE POLICY "Allow service role all" ON pixels
    FOR ALL USING (true);

-- Initialize canvas with white pixels (optional, improves initial load)
-- Uncomment if you want to pre-populate the canvas
/*
INSERT INTO pixels (x, y, color)
SELECT x, y, 0
FROM generate_series(0, 499) AS x
CROSS JOIN generate_series(0, 499) AS y
ON CONFLICT (x, y) DO NOTHING;
*/

-- Enable realtime for this table
-- Note: You also need to enable this in Supabase Dashboard:
-- 1. Go to Database > Replication
-- 2. Enable "supabase_realtime" for the "pixels" table
-- 3. Set Replica Identity to FULL for complete payload

ALTER PUBLICATION supabase_realtime ADD TABLE pixels;
