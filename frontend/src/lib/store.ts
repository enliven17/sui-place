import { create } from 'zustand';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, ColorIndex } from './constants';
import { fetchAllPixels, subscribeToPixelChanges, PixelRow } from './supabase';

interface CanvasState {
    // Pixel grid: Map of "x,y" -> { color: number, owner: string | null }
    pixels: Map<string, { color: number; owner: string | null }>;

    // Selected color for drawing
    selectedColor: ColorIndex;

    // Hover position
    hoverPosition: { x: number; y: number } | null;

    // Loading state
    isLoading: boolean;

    // Cooldown
    cooldownEnd: number | null;

    // Actions
    setPixel: (x: number, y: number, color: number, owner?: string | null) => void;
    revertPixel: (x: number, y: number, previousState: { color: number; owner: string | null } | null) => void;
    setSelectedColor: (color: ColorIndex) => void;
    setHoverPosition: (pos: { x: number; y: number } | null) => void;
    loadCanvas: () => Promise<void>;
    startCooldown: (duration: number) => void;
    getPixelColor: (x: number, y: number) => string;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
    pixels: new Map(),
    selectedColor: 5, // Default to red
    hoverPosition: null,
    isLoading: true,
    cooldownEnd: null,

    setPixel: (x, y, color, owner = null) => {
        set((state) => {
            const newPixels = new Map(state.pixels);
            const current = newPixels.get(`${x},${y}`) || { color: 0, owner: null };
            newPixels.set(`${x},${y}`, {
                color,
                owner: owner ?? current.owner
            });
            return { pixels: newPixels };
        });
    },

    revertPixel: (x, y, previousState) => {
        set((state) => {
            const newPixels = new Map(state.pixels);
            if (previousState === null) {
                // If there was no previous state, remove the pixel (revert to default white)
                newPixels.delete(`${x},${y}`);
            } else {
                // Restore the previous state
                newPixels.set(`${x},${y}`, previousState);
            }
            return { pixels: newPixels };
        });
    },

    setSelectedColor: (color) => set({ selectedColor: color }),

    setHoverPosition: (pos) => set({ hoverPosition: pos }),

    loadCanvas: async () => {
        set({ isLoading: true });

        try {
            const pixelData = await fetchAllPixels();
            const pixelMap = new Map<string, { color: number; owner: string | null }>();

            for (const pixel of pixelData) {
                pixelMap.set(`${pixel.x},${pixel.y}`, {
                    color: pixel.color,
                    owner: pixel.last_painter
                });
            }

            set({ pixels: pixelMap, isLoading: false });

            // Subscribe to real-time updates
            subscribeToPixelChanges((pixel) => {
                get().setPixel(pixel.x, pixel.y, pixel.color, pixel.last_painter);
            });

        } catch (error) {
            console.error('Failed to load canvas:', error);
            set({ isLoading: false });
        }
    },

    startCooldown: (duration) => {
        set({ cooldownEnd: Date.now() + duration });

        setTimeout(() => {
            set({ cooldownEnd: null });
        }, duration);
    },

    getPixelColor: (x, y) => {
        const pixel = get().pixels.get(`${x},${y}`);
        return pixel ? COLORS[pixel.color as ColorIndex] : COLORS[0];
    },
}));
