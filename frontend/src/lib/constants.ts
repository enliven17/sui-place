// Canvas Configuration
export const CANVAS_WIDTH = 50;
export const CANVAS_HEIGHT = 50;
export const PIXEL_SIZE = 2; // Display size of each pixel
export const COOLDOWN_MS = 10000; // 10 seconds

// Pixellar 16-color palette (Orange-themed)
export const COLORS = [
    '#FFFFFF', // 0 - White
    '#FFE5CC', // 1 - Light Orange Tint
    '#FFB366', // 2 - Light Orange
    '#FF8C00', // 3 - Dark Orange (Primary)
    '#FF6B35', // 4 - Red Orange
    '#E55300', // 5 - Burnt Orange
    '#CC4E00', // 6 - Deep Orange
    '#A04000', // 7 - Brown Orange
    '#FFD700', // 8 - Gold
    '#FFA500', // 9 - Orange
    '#FF7F00', // 10 - Bright Orange
    '#FF4500', // 11 - Orange Red
    '#8B4513', // 12 - Saddle Brown
    '#654321', // 13 - Dark Brown
    '#2C1810', // 14 - Very Dark Brown
    '#000000', // 15 - Black
] as const;

export type ColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

// Sui Configuration
export const SUI_NETWORK = 'testnet' as const;
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
export const CANVAS_OBJECT_ID = process.env.NEXT_PUBLIC_CANVAS_OBJECT_ID || '';

// Stellar Configuration
export const STELLAR_NETWORK = 'testnet' as const;
export const STELLAR_GAME_HUB_CONTRACT = 'CB4VZAT2U3UC6XFK3N23SKRF2NDCMP3QHJYMCHHFMZO7MRQO6DQ2EMYG';
export const STELLAR_CANVAS_CONTRACT = process.env.NEXT_PUBLIC_STELLAR_CONTRACT_ID || '';
export const STELLAR_HORIZON_URL = 'https://horizon-testnet.stellar.org';

// Starknet Configuration
export const STARKNET_NETWORK = 'sepolia' as const;
export const STARKNET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STARKNET_CONTRACT_ADDRESS || '';

// Blockchain types
export type BlockchainType = 'sui' | 'stellar' | 'starknet';
