// Canvas Configuration
export const CANVAS_WIDTH = 500;
export const CANVAS_HEIGHT = 500;
export const PIXEL_SIZE = 2; // Display size of each pixel
export const COOLDOWN_MS = 10000; // 10 seconds

// r/place 16-color palette
export const COLORS = [
    '#FFFFFF', // 0 - White
    '#E4E4E4', // 1 - Light Gray
    '#888888', // 2 - Gray
    '#222222', // 3 - Black
    '#FFA7D1', // 4 - Pink
    '#E50000', // 5 - Red
    '#E59500', // 6 - Orange
    '#A06A42', // 7 - Brown
    '#E5D900', // 8 - Yellow
    '#94E044', // 9 - Light Green
    '#02BE01', // 10 - Green
    '#00D3DD', // 11 - Cyan
    '#0083C7', // 12 - Blue
    '#0000EA', // 13 - Dark Blue
    '#CF6EE4', // 14 - Purple
    '#820080', // 15 - Dark Purple
] as const;

export type ColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

// Sui Configuration
export const SUI_NETWORK = 'testnet' as const;
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
export const CANVAS_OBJECT_ID = process.env.NEXT_PUBLIC_CANVAS_OBJECT_ID || '';
