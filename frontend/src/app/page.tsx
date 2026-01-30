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
          liquidStrength={0.25}
          liquidRadius={1.5}
          liquidWobbleSpeed={5}
          speed={0.5}
          edgeFade={0.25}
          transparent
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 pointer-events-none">
        <div className="text-center space-y-8 max-w-4xl">
          {/* Logo/Title */}
          <div className="space-y-4">
            <h1
              className="text-7xl md:text-8xl font-bold tracking-tight"
            >
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #3B82F6, #FFFFFF, #3B82F6)',
                  backgroundSize: '200% 100%',
                  animation: 'gradient-x 3s ease infinite',
                }}
              >
                Sui
              </span>
              <span className="text-white">Place</span>
            </h1>
            <p
              className="text-xl md:text-2xl text-white font-light"
              style={{ textShadow: '0 0 30px rgba(0,0,0,0.9), 0 0 60px rgba(0,0,0,0.7), 0 2px 10px rgba(0,0,0,0.9)' }}
            >
              Collaborative pixel art on the Sui blockchain
            </p>
          </div>


          {/* CTA Button */}
          <div className="flex justify-center items-center pt-8">
            <Link href="/game" className="pointer-events-auto">
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full border border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm">
                Let's Paint
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

      {/* Gradient animation keyframes */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </main>
  );
}
