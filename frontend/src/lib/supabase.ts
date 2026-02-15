import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
    if (typeof window === 'undefined') {
        return null; // Server-side - return null
    }

    if (supabase) {
        return supabase;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase environment variables not set');
        return null;
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
    return supabase;
}

export type PixelRow = {
    x: number;
    y: number;
    color: number;
    last_painter: string | null;
    blockchain: 'sui' | 'stellar' | 'starknet';
    tx_hash: string | null;
    updated_at: string;
};

// Fetch all pixels from Supabase
export async function fetchAllPixels(): Promise<PixelRow[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client
        .from('pixels')
        .select('*');

    if (error) {
        console.error('Error fetching pixels detailed:', JSON.stringify(error, null, 2));
        console.log('Supabase Config Check:', {
            urlPresent: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            keyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        });
        return [];
    }

    return data || [];
}

// Upsert a pixel directly (Multi-chain support)
export async function upsertPixel(
    x: number, 
    y: number, 
    color: number, 
    painter: string | null,
    blockchain: 'sui' | 'stellar' | 'starknet' = 'sui',
    txHash: string | null = null
) {
    const client = getSupabaseClient();
    if (!client) return;

    try {
        const { error } = await client
            .from('pixels')
            .upsert({
                x,
                y,
                color,
                last_painter: painter,
                blockchain,
                tx_hash: txHash,
                updated_at: new Date().toISOString()
            }, { onConflict: 'x,y' });

        if (error) {
            console.error('Error updating Supabase:', error);
        }
    } catch (e) {
        console.error('Exception updating Supabase:', e);
    }
}

// Subscribe to pixel changes
export function subscribeToPixelChanges(
    onPixelChange: (pixel: PixelRow) => void
): () => void {
    const client = getSupabaseClient();
    if (!client) return () => { };

    const channel = client
        .channel('canvas-updates')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'pixels'
            },
            (payload) => {
                if (payload.new && typeof payload.new === 'object') {
                    onPixelChange(payload.new as PixelRow);
                }
            }
        )
        .subscribe();

    return () => {
        client.removeChannel(channel);
    };
}
