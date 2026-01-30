'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import Canvas from '@/components/Canvas';
import ColorPicker from '@/components/ColorPicker';
import PixelInfo from '@/components/PixelInfo';
import CooldownTimer from '@/components/CooldownTimer';
import WalletButton from '@/components/WalletButton';
import { useCanvasStore } from '@/lib/store';
import { createDrawTransaction } from '@/lib/sui';
import { upsertPixel } from '@/lib/supabase';
import { COOLDOWN_MS, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/lib/constants';

export default function Game() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const { selectedColor, cooldownEnd, startCooldown, setPixel, revertPixel } = useCanvasStore();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handlePixelClick = useCallback(async (x: number, y: number) => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    if (cooldownEnd && Date.now() < cooldownEnd) {
      setError('Please wait for cooldown to finish');
      return;
    }

    setError(null);

    // Save previous state before optimistic update
    const previousPixelState = useCanvasStore.getState().pixels.get(`${x},${y}`) || null;

    // Optimistic update
    setPixel(x, y, selectedColor);

    try {
      const tx = createDrawTransaction(x, y, selectedColor);

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async () => {
            console.log('Pixel placed successfully!');
            startCooldown(COOLDOWN_MS);

            // Show success notification
            setSuccessMessage('Pixel placed successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);

            // Direct write to Supabase (bypassing indexer)
            if (account) {
              await upsertPixel(x, y, selectedColor, account.address);
            }
          },
          onError: (err: Error) => {
            console.error('Transaction failed:', err);

            // Revert optimistic update
            revertPixel(x, y, previousPixelState);

            // Check if user rejected the transaction
            const errorMessage = err.message?.toLowerCase() || '';
            if (errorMessage.includes('rejected') || errorMessage.includes('user rejected') || errorMessage.includes('cancelled') || errorMessage.includes('denied')) {
              setError('Transaction rejected by user.');
            } else {
              setError('Transaction failed. Please try again.');
            }
          }
        }
      );
    } catch (err) {
      console.error('Error creating transaction:', err);
      // Revert optimistic update on error
      revertPixel(x, y, previousPixelState);
      setError('Failed to create transaction');
    }
  }, [account, cooldownEnd, selectedColor, signAndExecute, startCooldown, setPixel, revertPixel]);

  return (
    <main className="h-screen overflow-hidden bg-gray-950 relative">
      <Canvas onPixelClick={handlePixelClick} />

      <div className="absolute top-4 left-4 z-40 flex items-center gap-2 bg-gray-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-800/50">
        <Link href="/">
          <h1 className="text-sm font-bold text-white hover:text-blue-400 transition-colors cursor-pointer">SuiPlace</h1>
        </Link>
        <span className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded font-medium">Testnet</span>
      </div>

      <div className="absolute top-4 right-4 z-40">
        <CooldownTimer />
      </div>

      {isPending && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-white">Placing pixel...</span>
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
        {/* Toggle Button - Attached to top of panel */}
        <div className="absolute -top-[36px] left-1/2 -translate-x-1/2">
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="bg-gray-900/95 hover:bg-gray-800/95 backdrop-blur-md text-gray-200 px-6 py-2 rounded-t-lg border border-gray-700 border-b-0 hover:border-gray-600 shadow-xl transition-all duration-200"
          >
            <span className={`block text-sm transition-transform duration-300 ${isPanelOpen ? 'rotate-180' : ''}`}>↑</span>
          </button>
        </div>

        <div className="bg-gray-900/98 backdrop-blur-xl border-t border-gray-700 overflow-y-auto p-6" style={{ maxHeight: '70vh' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors duration-300">
                <h2 className="text-xs font-semibold text-gray-200 mb-3">Color Palette</h2>
                <ColorPicker />
                <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-center">
                  <WalletButton />
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors duration-300">
                <h2 className="text-xs font-semibold text-gray-200 mb-3">Pixel Details</h2>
                <PixelInfo />
              </div>

              <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors duration-300">
                <h2 className="text-xs font-semibold text-gray-200 mb-3">Controls</h2>
                <div className="space-y-2">
                  <div className="text-xs text-gray-300 bg-gray-900/30 px-2.5 py-2 rounded-lg">Click to place pixel</div>
                  <div className="text-xs text-gray-300 bg-gray-900/30 px-2.5 py-2 rounded-lg">Scroll to zoom</div>
                  <div className="text-xs text-gray-300 bg-gray-900/30 px-2.5 py-2 rounded-lg">Drag to pan</div>
                  <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-900/30 px-2.5 py-2 rounded-lg mt-3 border-t border-gray-700/50 pt-2">
                    <span>Canvas</span>
                    <span className="font-mono text-blue-400">{CANVAS_WIDTH} × {CANVAS_HEIGHT}</span>
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
