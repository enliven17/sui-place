import { create } from 'zustand';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, ColorIndex, BlockchainType } from './constants';
import { fetchAllPixels, subscribeToPixelChanges, PixelRow } from './supabase';

interface CanvasState {
    // Pixel grid: Map of "x,y" -> { color: number, owner: string | null, blockchain: BlockchainType }
    pixels: Map<string, { color: number; owner: string | null; blockchain: BlockchainType }>;

    // Selected color for drawing
    selectedColor: ColorIndex;

    // Selected blockchain
    selectedBlockchain: BlockchainType;

    // Hover position
    hoverPosition: { x: number; y: number } | null;

    // Loading state
    isLoading: boolean;

    // Cooldown per blockchain
    cooldowns: Map<BlockchainType, number | null>;

    // Connected wallets
    connectedWallets: {
        sui: string | null;
        stellar: string | null;
        starknet: string | null;
    };

    // Actions
    setPixel: (x: number, y: number, color: number, owner?: string | null, blockchain?: BlockchainType) => void;
    revertPixel: (x: number, y: number, previousState: { color: number; owner: string | null; blockchain: BlockchainType } | null) => void;
    setSelectedColor: (color: ColorIndex) => void;
    setSelectedBlockchain: (blockchain: BlockchainType) => void;
    setHoverPosition: (pos: { x: number; y: number } | null) => void;
    loadCanvas: () => Promise<void>;
    startCooldown: (blockchain: BlockchainType, duration: number) => void;
    getPixelColor: (x: number, y: number) => string;
    setWalletAddress: (blockchain: BlockchainType, address: string | null) => void;
    getCooldownEnd: (blockchain: BlockchainType) => number | null;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
    pixels: new Map(),
    selectedColor: 6, // Default to orange
    selectedBlockchain: 'sui',
    hoverPosition: null,
    isLoading: true,
    cooldowns: new Map([
        ['sui', null],
        ['stellar', null],
        ['starknet', null]
    ]),
    connectedWallets: {
        sui: null,
        stellar: null,
        starknet: null
    },

    setPixel: (x, y, color, owner = null, blockchain = 'sui') => {
        set((state) => {
            const newPixels = new Map(state.pixels);
            const current = newPixels.get(`${x},${y}`) || { color: 0, owner: null, blockchain: 'sui' };
            newPixels.set(`${x},${y}`, {
                color,
                owner: owner ?? current.owner,
                blockchain
            });
            return { pixels: newPixels };
        });
    },

    revertPixel: (x, y, previousState) => {
        set((state) => {
            const newPixels = new Map(state.pixels);
            if (previousState === null) {
                newPixels.delete(`${x},${y}`);
            } else {
                newPixels.set(`${x},${y}`, previousState);
            }
            return { pixels: newPixels };
        });
    },

    setSelectedColor: (color) => set({ selectedColor: color }),

    setSelectedBlockchain: (blockchain) => set({ selectedBlockchain: blockchain }),

    setHoverPosition: (pos) => set({ hoverPosition: pos }),

    loadCanvas: async () => {
        set({ isLoading: true });

        try {
            const pixelData = await fetchAllPixels();
            const pixelMap = new Map<string, { color: number; owner: string | null; blockchain: BlockchainType }>();

            for (const pixel of pixelData) {
                pixelMap.set(`${pixel.x},${pixel.y}`, {
                    color: pixel.color,
                    owner: pixel.last_painter,
                    blockchain: pixel.blockchain || 'sui'
                });
            }

            set({ pixels: pixelMap, isLoading: false });

            subscribeToPixelChanges((pixel) => {
                get().setPixel(
                    pixel.x, 
                    pixel.y, 
                    pixel.color, 
                    pixel.last_painter, 
                    pixel.blockchain || 'sui'
                );
            });

        } catch (error) {
            console.error('Failed to load canvas:', error);
            set({ isLoading: false });
        }
    },

    startCooldown: (blockchain, duration) => {
        set((state) => {
            const newCooldowns = new Map(state.cooldowns);
            newCooldowns.set(blockchain, Date.now() + duration);
            return { cooldowns: newCooldowns };
        });

        setTimeout(() => {
            set((state) => {
                const newCooldowns = new Map(state.cooldowns);
                newCooldowns.set(blockchain, null);
                return { cooldowns: newCooldowns };
            });
        }, duration);
    },

    getPixelColor: (x, y) => {
        const pixel = get().pixels.get(`${x},${y}`);
        return pixel ? COLORS[pixel.color as ColorIndex] : COLORS[0];
    },

    setWalletAddress: (blockchain, address) => {
        set((state) => ({
            connectedWallets: {
                ...state.connectedWallets,
                [blockchain]: address
            }
        }));
    },

    getCooldownEnd: (blockchain) => {
        return get().cooldowns.get(blockchain) || null;
    }
}));
