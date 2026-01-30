'use client';

import { useCallback, useState } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import Canvas from '@/components/Canvas';
import ColorPicker from '@/components/ColorPicker';
import PixelInfo from '@/components/PixelInfo';
import CooldownTimer from '@/components/CooldownTimer';
import WalletButton from '@/components/WalletButton';
import { useCanvasStore } from '@/lib/store';
import { createDrawTransaction } from '@/lib/sui';
import { COOLDOWN_MS, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/lib/constants';

export default function Home() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const { selectedColor, cooldownEnd, startCooldown, setPixel } = useCanvasStore();
  const [error, setError] = useState<string | null>(null);

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

    // Optimistic update
    setPixel(x, y, selectedColor);

    try {
      const tx = createDrawTransaction(x, y, selectedColor);

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            console.log('Pixel placed successfully!');
            startCooldown(COOLDOWN_MS);
          },
          onError: (err) => {
            console.error('Transaction failed:', err);
            setError('Transaction failed. Please try again.');
          }
        }
      );
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError('Failed to create transaction');
    }
  }, [account, cooldownEnd, selectedColor, signAndExecute, startCooldown, setPixel]);

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              SuiPlace
            </h1>
            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full font-medium">
              Testnet
            </span>
          </div>

          <div className="flex items-center gap-6">
            <CooldownTimer />
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas Area */}
        <div className="flex-1 relative">
          <Canvas onPixelClick={handlePixelClick} />

          {/* Loading overlay */}
          {isPending && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                <span className="text-white">Placing pixel...</span>
              </div>
            </div>
          )}

          {/* Error toast */}
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg">
              {error}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-64 border-l border-gray-800 bg-gray-900/50 p-4 flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-2">Select Color</h2>
            <ColorPicker />
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-2">Pixel Info</h2>
            <PixelInfo />
          </div>

          <div className="mt-auto">
            <div className="text-xs text-gray-500 space-y-1">
              <p>🖱️ Click to place a pixel</p>
              <p>🔍 Scroll to zoom</p>
              <p>✋ Shift+drag to pan</p>
              <p className="pt-2 border-t border-gray-800 mt-2">
                Canvas: {CANVAS_WIDTH}×{CANVAS_HEIGHT}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
