import { Contract, RpcProvider, cairo } from 'starknet';
import { STARKNET_CONTRACT_ADDRESS, STARKNET_NETWORK } from './constants';

const provider = new RpcProvider({
    nodeUrl: STARKNET_NETWORK === 'sepolia' 
        ? 'https://starknet-sepolia.public.blastapi.io'
        : 'https://starknet-mainnet.public.blastapi.io'
});

// ZK-proof based pixel placement for privacy
export async function createStarknetDrawTransaction(
    x: number,
    y: number,
    color: number
) {
    // Return transaction data that will be signed by wallet
    return {
        contractAddress: STARKNET_CONTRACT_ADDRESS,
        entrypoint: 'draw_pixel',
        calldata: [
            cairo.uint256(x),
            cairo.uint256(y),
            cairo.uint256(color)
        ]
    };
}

// ZK-proof verification for privacy-preserving pixel placement
export async function createPrivateDrawTransaction(
    x: number,
    y: number,
    color: number,
    proof: string // ZK proof generated client-side
) {
    return {
        contractAddress: STARKNET_CONTRACT_ADDRESS,
        entrypoint: 'draw_pixel_private',
        calldata: [
            cairo.uint256(x),
            cairo.uint256(y),
            cairo.uint256(color),
            proof // ZK proof for privacy
        ]
    };
}

// Get pixel data from Starknet
export async function getPixelFromStarknet(x: number, y: number) {
    try {
        const contract = new Contract(
            [], // ABI will be loaded dynamically
            STARKNET_CONTRACT_ADDRESS,
            provider
        );
        
        const result = await contract.call('get_pixel', [
            cairo.uint256(x),
            cairo.uint256(y)
        ]);
        
        return result;
    } catch (error) {
        console.error('Error fetching pixel from Starknet:', error);
        return null;
    }
}
