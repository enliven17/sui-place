'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import Canvas from '@/components/Canvas';
import ColorPicker from '@/components/ColorPicker';
import PixelInfo from '@/components/PixelInfo';
import CooldownTimer from '@/components/CooldownTimer';
import MultiChainWallet from '@/components/MultiChainWallet';
import { useCanvasStore } from '@/lib/store';
import { createDrawTransaction } from '@/lib/sui';
import { createStellarDrawTransaction } from '@/lib/stellar';
import { createStarknetDrawTransaction } from '@/lib/starknet';
import { upsertPixel } from '@/lib/supabase';
import { COOLDOWN_MS, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/lib/constants';

export default function Game() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute, isPending: isSuiPending } = useSignAndExecuteTransaction();
  const { 
    selectedColor, 
    selectedBlockchain, 
    connectedWallets,
    getCooldownEnd, 
    startCooldown, 
    setPixel, 
    revertPixel 
  } = useCanvasStore();
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePixelClick = useCallback(async (x: number, y: number) => {
    const cooldownEnd = getCooldownEnd(selectedBlockchain);
    
    if (cooldownEnd && Date.now() < cooldownEnd) {
      setError('Please wait for cooldown to finish');
      return;
    }

    // Check wallet connection for selected blockchain
    const walletAddress = selectedBlockchain === 'sui' 
      ? account?.address 
      : connectedWallets[selectedBlockchain];

    if (!walletAddress) {
      setError(`Please connect your ${selectedBlockchain.toUpperCase()} wallet first`);
      return;
    }

    setError(null);
    setIsProcessing(true);

    // Save previous state before optimistic update
    const previousPixelState = useCanvasStore.getState().pixels.get(`${x},${y}`) || null;

    // Optimistic update
    setPixel(x, y, selectedColor, walletAddress, selectedBlockchain);

    try {
      if (selectedBlockchain === 'sui') {
        await handleSuiTransaction(x, y, walletAddress, previousPixelState);
      } else if (selectedBlockchain === 'stellar') {
        await handleStellarTransaction(x, y, walletAddress, previousPixelState);
      } else if (selectedBlockchain === 'starknet') {
        await handleStarknetTransaction(x, y, walletAddress, previousPixelState);
      }
    } catch (err) {
      console.error('Error placing pixel:', err);
      revertPixel(x, y, previousPixelState);
      setError('Failed to place pixel');
      setIsProcessing(false);
    }
  }, [account, selectedBlockchain, selectedColor, connectedWallets, getCooldownEnd, signAndExecute, startCooldown, setPixel, revertPixel]);

  const handleSuiTransaction = async (
    x: number, 
    y: number, 
    walletAddress: string, 
    previousPixelState: any
  ) => {
    const tx = createDrawTransaction(x, y, selectedColor);

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: async (result) => {
          console.log('Sui pixel placed successfully!', result);
          startCooldown('sui', COOLDOWN_MS);
          setSuccessMessage('Pixel placed on Sui!');
          setTimeout(() => setSuccessMessage(null), 3000);
          setIsProcessing(false);

          await upsertPixel(x, y, selectedColor, walletAddress, 'sui', result.digest);
        },
        onError: (err: Error) => {
          console.error('Sui transaction failed:', err);
          revertPixel(x, y, previousPixelState);
          
          const errorMessage = err.message?.toLowerCase() || '';
          if (errorMessage.includes('rejected') || errorMessage.includes('cancelled')) {
            setError('Transaction rejected by user');
          } else {
            setError('Sui transaction failed');
          }
          setIsProcessing(false);
        }
      }
    );
  };

  const handleStellarTransaction = async (
    x: number, 
    y: number, 
    walletAddress: string, 
    previousPixelState: any
  ) => {
    try {
      const tx = await createStellarDrawTransaction(walletAddress, x, y, selectedColor);
      
      // Sign with Freighter
      if (!window.freighter) {
        throw new Error('Freighter wallet not found');
      }

      const signedTx = await window.freighter.signTransaction(tx.toXDR(), {
        networkPassphrase: 'Test SDF Network ; September 2015'
      });

      // Submit transaction
      const response = await fetch('https://horizon-testnet.stellar.org/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `tx=${encodeURIComponent(signedTx)}`
      });

      if (!response.ok) {
        throw new Error('Failed to submit Stellar transaction');
      }

      const result = await response.json();
      
      startCooldown('stellar', COOLDOWN_MS);
      setSuccessMessage('Pixel placed on Stellar!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setIsProcessing(false);

      await upsertPixel(x, y, selectedColor, walletAddress, 'stellar', result.hash);
    } catch (err) {
      console.error('Stellar transaction failed:', err);
      revertPixel(x, y, previousPixelState);
      setError('Stellar transaction failed');
      setIsProcessing(false);
    }
  };

  const handleStarknetTransaction = async (
    x: number, 
    y: number, 
    walletAddress: string, 
    previousPixelState: any
  ) => {
    try {
      const txData = await createStarknetDrawTransaction(x, y, selectedColor);
      
      if (!window.starknet) {
        throw new Error('Starknet wallet not found');
      }

      const result = await window.starknet.account.execute([txData]);
      
      startCooldown('starknet', COOLDOWN_MS);
      setSuccessMessage('Pixel placed on Starknet!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setIsProcessing(false);

      await upsertPixel(x, y, selectedColor, walletAddress, 'starknet', result.transaction_hash);
    } catch (err) {
      console.error('Starknet transaction failed:', err);
      revertPixel(x, y, previousPixelState);
      setError('Starknet transaction failed');
      setIsProcessing(false);
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-gradient-to-br from-orange-950 via-gray-950 to-orange-900 relative">
      <Canvas onPixelClick={handlePixelClick} />

      <div className="absolute top-4 left-4 z-40 flex items-center gap-2 bg-orange-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-orange-700/50">
        <Link href="/">
          <h1 className="text-sm font-bold text-white hover:text-orange-300 transition-colors cursor-pointer">Pixellar</h1>
        </Link>
        <span className="text-xs px-1.5 py-0.5 bg-orange-500/20 text-orange-300 rounded font-medium">Multi-Chain</span>
      </div>

      <div className="absolute top-4 right-4 z-40">
        <CooldownTimer />
      </div>

      {(isSuiPending || isProcessing) && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="bg-orange-800 rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-orange-300 border-t-transparent rounded-full" />
            <span className="text-white">Placing pixel on {selectedBlockchain.toUpperCase()}...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg z-40 animate-pulse">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg z-40">
          ✓ {successMessage}
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-out ${isPanelOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
      >
        <div className="absolute -top-[36px] left-1/2 -translate-x-1/2">
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="bg-orange-900/95 hover:bg-orange-800/95 backdrop-blur-md text-orange-200 px-6 py-2 rounded-t-lg border border-orange-700 border-b-0 hover:border-orange-600 shadow-xl transition-all duration-200"
          >
            <span className={`block text-sm transition-transform duration-300 ${isPanelOpen ? 'rotate-180' : ''}`}>↑</span>
          </button>
        </div>

        <div className="bg-orange-900/98 backdrop-blur-xl border-t border-orange-700 overflow-y-auto p-6" style={{ maxHeight: '70vh' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-orange-800/40 backdrop-blur-sm rounded-lg p-4 border border-orange-700 hover:border-orange-600 transition-colors duration-300">
                <h2 className="text-xs font-semibold text-orange-200 mb-3">Color Palette</h2>
                <ColorPicker />
              </div>

              <div className="bg-orange-800/40 backdrop-blur-sm rounded-lg p-4 border border-orange-700 hover:border-orange-600 transition-colors duration-300">
                <h2 className="text-xs font-semibold text-orange-200 mb-3">Multi-Chain Wallets</h2>
                <MultiChainWallet />
              </div>

              <div className="bg-orange-800/40 backdrop-blur-sm rounded-lg p-4 border border-orange-700 hover:border-orange-600 transition-colors duration-300">
                <h2 className="text-xs font-semibold text-orange-200 mb-3">Pixel Details</h2>
                <PixelInfo />
                <div className="mt-4 pt-3 border-t border-orange-700/50">
                  <h3 className="text-xs font-semibold text-orange-200 mb-2">Controls</h3>
                  <div className="space-y-1.5">
                    <div className="text-xs text-orange-300 bg-orange-900/30 px-2 py-1.5 rounded">Click to place pixel</div>
                    <div className="text-xs text-orange-300 bg-orange-900/30 px-2 py-1.5 rounded">Scroll to zoom</div>
                    <div className="text-xs text-orange-300 bg-orange-900/30 px-2 py-1.5 rounded">Drag to pan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
