import { create } from 'zustand';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, ColorIndex } from './constants';
import { fetchAllPixels, subscribeToPixelChanges, PixelRow } from './supabase';

interface CanvasState {
    // Pixel grid: Map of "x,y" -> color index
    pixels: Map<string, number>;

    // Selected color for drawing
    selectedColor: ColorIndex;

    // Hover position
    hoverPosition: { x: number; y: number } | null;

    // Loading state
    isLoading: boolean;

    // Cooldown
    cooldownEnd: number | null;

    // Actions
    setPixel: (x: number, y: number, color: number) => void;
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

    setPixel: (x, y, color) => {
        set((state) => {
            const newPixels = new Map(state.pixels);
            newPixels.set(`${x},${y}`, color);
            return { pixels: newPixels };
        });
    },

    setSelectedColor: (color) => set({ selectedColor: color }),

    setHoverPosition: (pos) => set({ hoverPosition: pos }),

    loadCanvas: async () => {
        set({ isLoading: true });

        try {
            const pixelData = await fetchAllPixels();
            const pixelMap = new Map<string, number>();

            for (const pixel of pixelData) {
                pixelMap.set(`${pixel.x},${pixel.y}`, pixel.color);
            }

            set({ pixels: pixelMap, isLoading: false });

            // Subscribe to real-time updates
            subscribeToPixelChanges((pixel) => {
                get().setPixel(pixel.x, pixel.y, pixel.color);
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
        const colorIndex = get().pixels.get(`${x},${y}`);
        return colorIndex !== undefined ? COLORS[colorIndex as ColorIndex] : COLORS[0];
    },
}));
