'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useCanvasStore } from '@/lib/store';
import { BlockchainType } from '@/lib/constants';

// Freighter API for Stellar
declare global {
    interface Window {
        freighter?: any;
        starknet?: any;
    }
}

export default function MultiChainWallet() {
    const suiAccount = useCurrentAccount();
    const { selectedBlockchain, setSelectedBlockchain, connectedWallets, setWalletAddress } = useCanvasStore();
    
    const [stellarAddress, setStellarAddress] = useState<string | null>(null);
    const [starknetAddress, setStarknetAddress] = useState<string | null>(null);

    // Update Sui wallet in store
    useEffect(() => {
        setWalletAddress('sui', suiAccount?.address || null);
    }, [suiAccount, setWalletAddress]);

    // Connect Stellar wallet
    const connectStellar = async () => {
        try {
            if (!window.freighter) {
                alert('Please install Freighter wallet extension');
                window.open('https://www.freighter.app/', '_blank');
                return;
            }

            const publicKey = await window.freighter.getPublicKey();
            setStellarAddress(publicKey);
            setWalletAddress('stellar', publicKey);
        } catch (error) {
            console.error('Failed to connect Stellar wallet:', error);
        }
    };

    // Connect Starknet wallet
    const connectStarknet = async () => {
        try {
            if (!window.starknet) {
                alert('Please install ArgentX or Braavos wallet extension');
                window.open('https://www.argent.xyz/argent-x/', '_blank');
                return;
            }

            await window.starknet.enable();
            const address = window.starknet.selectedAddress;
            setStarknetAddress(address);
            setWalletAddress('starknet', address);
        } catch (error) {
            console.error('Failed to connect Starknet wallet:', error);
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="flex flex-col gap-2 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-2 border-orange-300">
            <h3 className="text-sm font-bold text-orange-900 mb-2">Select Blockchain</h3>
            
            {/* Blockchain Selector */}
            <div className="flex gap-2 mb-3">
                <button
                    onClick={() => setSelectedBlockchain('sui')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        selectedBlockchain === 'sui'
                            ? 'bg-orange-600 text-white shadow-md'
                            : 'bg-white text-orange-700 hover:bg-orange-50'
                    }`}
                >
                    Sui
                </button>
                <button
                    onClick={() => setSelectedBlockchain('stellar')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        selectedBlockchain === 'stellar'
                            ? 'bg-orange-600 text-white shadow-md'
                            : 'bg-white text-orange-700 hover:bg-orange-50'
                    }`}
                >
                    Stellar
                </button>
                <button
                    onClick={() => setSelectedBlockchain('starknet')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        selectedBlockchain === 'starknet'
                            ? 'bg-orange-600 text-white shadow-md'
                            : 'bg-white text-orange-700 hover:bg-orange-50'
                    }`}
                >
                    Starknet
                </button>
            </div>

            {/* Wallet Connection Status */}
            <div className="space-y-2">
                {/* Sui Wallet */}
                <div className="flex items-center justify-between p-2 bg-white rounded border border-orange-200">
                    <span className="text-xs font-medium text-orange-900">Sui:</span>
                    {suiAccount ? (
                        <span className="text-xs text-orange-700">{formatAddress(suiAccount.address)}</span>
                    ) : (
                        <span className="text-xs text-gray-400">Not connected</span>
                    )}
                </div>

                {/* Stellar Wallet */}
                <div className="flex items-center justify-between p-2 bg-white rounded border border-orange-200">
                    <span className="text-xs font-medium text-orange-900">Stellar:</span>
                    {stellarAddress ? (
                        <span className="text-xs text-orange-700">{formatAddress(stellarAddress)}</span>
                    ) : (
                        <button
                            onClick={connectStellar}
                            className="text-xs text-orange-600 hover:text-orange-800 underline"
                        >
                            Connect
                        </button>
                    )}
                </div>

                {/* Starknet Wallet */}
                <div className="flex items-center justify-between p-2 bg-white rounded border border-orange-200">
                    <span className="text-xs font-medium text-orange-900">Starknet:</span>
                    {starknetAddress ? (
                        <span className="text-xs text-orange-700">{formatAddress(starknetAddress)}</span>
                    ) : (
                        <button
                            onClick={connectStarknet}
                            className="text-xs text-orange-600 hover:text-orange-800 underline"
                        >
                            Connect
                        </button>
                    )}
                </div>
            </div>

            {/* Active Blockchain Indicator */}
            <div className="mt-2 p-2 bg-orange-600 text-white rounded text-center">
                <span className="text-xs font-bold">
                    Active: {selectedBlockchain.toUpperCase()}
                </span>
            </div>
        </div>
    );
}
