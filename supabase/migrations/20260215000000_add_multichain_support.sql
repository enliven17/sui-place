-- Pixellar Multi-Chain Support Migration
-- Add blockchain column to track which chain each pixel was placed on

-- Add blockchain column
ALTER TABLE pixels 
ADD COLUMN IF NOT EXISTS blockchain TEXT DEFAULT 'sui' CHECK (blockchain IN ('sui', 'stellar', 'starknet'));

-- Add transaction hash for verification
ALTER TABLE pixels 
ADD COLUMN IF NOT EXISTS tx_hash TEXT;

-- Create index for blockchain filtering
CREATE INDEX IF NOT EXISTS idx_pixels_blockchain ON pixels(blockchain);

-- Create index for transaction hash lookups
CREATE INDEX IF NOT EXISTS idx_pixels_tx_hash ON pixels(tx_hash);

-- Update RLS policies to allow inserts/updates from all chains
DROP POLICY IF EXISTS "Allow service role all" ON pixels;

CREATE POLICY "Allow authenticated insert" ON pixels
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON pixels
    FOR UPDATE USING (true);

-- Add comment for documentation
COMMENT ON COLUMN pixels.blockchain IS 'Blockchain where the pixel was placed: sui, stellar, or starknet';
COMMENT ON COLUMN pixels.tx_hash IS 'Transaction hash for on-chain verification';
