'use client';

import Link from 'next/link';
import PixelBlast from '@/components/PixelBlast';

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-black relative">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#3B82F6"
          patternScale={2}
          patternDensity={1}
          pixelSizeJitter={0}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid={false}
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.5}
          edgeFade={0.25}
          transparent
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-4xl">
          {/* Logo/Title */}
          <div className="space-y-4">
            <h1 className="text-7xl md:text-8xl font-bold text-white tracking-tight">
              SuiPlace
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light">
              Collaborative pixel art on the Sui blockchain
            </p>
          </div>

          {/* Description */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <p className="text-gray-400 text-lg">
              Place pixels, create art, and be part of a decentralized canvas where every pixel is owned on-chain.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center items-center pt-8">
            <Link href="/game">
              <button className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30">
                Start Creating →
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Testnet Badge */}
      <div className="absolute top-4 right-4 z-20">
        <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg font-medium text-sm border border-blue-500/30 backdrop-blur-sm">
          Testnet
        </span>
      </div>
    </main>
  );
}
