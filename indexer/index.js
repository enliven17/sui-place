import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Configuration
const NETWORK = 'testnet';
const PACKAGE_ID = process.env.PACKAGE_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!PACKAGE_ID || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing required environment variables:');
    console.error('  PACKAGE_ID - Your deployed Sui package ID');
    console.error('  SUPABASE_URL - Your Supabase project URL');
    console.error('  SUPABASE_SERVICE_KEY - Your Supabase service role key');
    process.exit(1);
}

// Initialize clients
const sui = new SuiClient({ url: getFullnodeUrl(NETWORK) });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log(`🚀 SuiPlace Indexer starting...`);
console.log(`📡 Network: ${NETWORK}`);
console.log(`📦 Package ID: ${PACKAGE_ID}`);

// Event handler
async function handlePixelChanged(event) {
    const { x, y, color, sender } = event.parsedJson;

    console.log(`🎨 Pixel changed: (${x}, ${y}) -> color ${color} by ${sender}`);

    try {
        const { error } = await supabase
            .from('pixels')
            .upsert({
                x: Number(x),
                y: Number(y),
                color: Number(color),
                last_painter: sender,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'x,y'
            });

        if (error) {
            console.error('❌ Supabase upsert error:', error);
        } else {
            console.log(`✅ Pixel (${x}, ${y}) synced to Supabase`);
        }
    } catch (err) {
        console.error('❌ Error processing event:', err);
    }
}

// Subscribe to events
async function subscribeToEvents() {
    console.log('📺 Subscribing to PixelChanged events...');

    try {
        const unsubscribe = await sui.subscribeEvent({
            filter: {
                MoveEventType: `${PACKAGE_ID}::canvas::PixelChanged`
            },
            onMessage: handlePixelChanged
        });

        console.log('✅ Successfully subscribed to events');
        console.log('👀 Watching for pixel changes...\n');

        // Keep process alive
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down indexer...');
            unsubscribe();
            process.exit(0);
        });

    } catch (err) {
        console.error('❌ Failed to subscribe to events:', err);
        process.exit(1);
    }
}

// Start indexer
subscribeToEvents();

// Force keep-alive
setInterval(() => { }, 1000); // 1 saat

