-- Pixellar Complete Database Setup
-- Bu SQL'i Supabase SQL Editor'de çalıştırın

-- 1. Pixels tablosunu oluştur
CREATE TABLE IF NOT EXISTS pixels (
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    color SMALLINT NOT NULL DEFAULT 0,
    last_painter TEXT,
    blockchain TEXT DEFAULT 'sui' CHECK (blockchain IN ('sui', 'stellar', 'starknet')),
    tx_hash TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (x, y)
);

-- 2. Index'leri oluştur
CREATE INDEX IF NOT EXISTS idx_pixels_updated ON pixels(updated_at);
CREATE INDEX IF NOT EXISTS idx_pixels_blockchain ON pixels(blockchain);
CREATE INDEX IF NOT EXISTS idx_pixels_tx_hash ON pixels(tx_hash);

-- 3. RLS (Row Level Security) aktif et
ALTER TABLE pixels ENABLE ROW LEVEL SECURITY;

-- 4. Eski policy'leri temizle
DROP POLICY IF EXISTS "Allow public read" ON pixels;
DROP POLICY IF EXISTS "Allow service role all" ON pixels;
DROP POLICY IF EXISTS "Allow authenticated insert" ON pixels;
DROP POLICY IF EXISTS "Allow authenticated update" ON pixels;

-- 5. Yeni policy'leri oluştur
CREATE POLICY "Enable read access for all users" ON pixels
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON pixels
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON pixels
    FOR UPDATE USING (true);

-- 6. Realtime'ı aktif et
ALTER PUBLICATION supabase_realtime ADD TABLE pixels;

-- 7. Kolon açıklamaları ekle
COMMENT ON COLUMN pixels.blockchain IS 'Blockchain where the pixel was placed: sui, stellar, or starknet';
COMMENT ON COLUMN pixels.tx_hash IS 'Transaction hash for on-chain verification';
COMMENT ON TABLE pixels IS 'Pixellar multi-chain collaborative canvas pixels';

-- 8. Test verisi ekle (opsiyonel)
INSERT INTO pixels (x, y, color, last_painter, blockchain, tx_hash) 
VALUES 
    (25, 25, 6, '0xtest...sui', 'sui', '0xsuihash123'),
    (26, 25, 9, 'GA2OFZVRG2QYK3Y7HOWJ3T575ZM7J22GJTMEDBJODW6QE7LC3T4BYMY7', 'stellar', 'stellarhash456'),
    (24, 25, 11, '0xstarknet...test', 'starknet', '0xstarknethash789')
ON CONFLICT (x, y) DO NOTHING;

-- Başarılı! ✅
SELECT 'Pixellar database setup complete! 🧡' as status;
