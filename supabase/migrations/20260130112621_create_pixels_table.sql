-- SuiPlace Database Schema
-- Migration: Create pixels table for canvas

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

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE pixels;
