'use client';

import { useCanvasStore } from '@/lib/store';
import { COLORS, ColorIndex } from '@/lib/constants';

export default function PixelInfo() {
    const { hoverPosition, pixels } = useCanvasStore();

    if (!hoverPosition) {
        return (
            <div className="flex items-center justify-center h-20 text-orange-500 text-xs bg-orange-900/30 rounded-lg border border-orange-700/50 border-dashed">
                Hover over canvas
            </div>
        );
    }

    const { x, y } = hoverPosition;
    const pixel = pixels.get(`${x},${y}`);
    const colorIndex = pixel?.color ?? 0;
    const color = COLORS[colorIndex as ColorIndex];
    const painter = pixel?.owner;
    const blockchain = pixel?.blockchain || 'sui';

    // Shorten address for display
    const shortPainter = painter ? `${painter.slice(0, 6)}...${painter.slice(-4)}` : null;

    // Blockchain badge colors
    const blockchainColors = {
        sui: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        stellar: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        starknet: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    };

    return (
        <div className="bg-orange-900/40 backdrop-blur-sm rounded-lg p-3 border border-orange-700/50">
            <div className="flex items-center gap-3">
                <div
                    className="w-12 h-12 rounded-lg border-2 border-orange-600 shadow-lg"
                    style={{ backgroundColor: color }}
                />
                <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-orange-400">Position</span>
                        <span className="text-xs font-mono text-orange-200 bg-orange-800/50 px-2 py-0.5 rounded">
                            {x}, {y}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-orange-400">Color</span>
                        <span className="text-xs font-mono text-orange-300 bg-orange-800/50 px-2 py-0.5 rounded">
                            #{colorIndex}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-orange-400">Chain</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${blockchainColors[blockchain]}`}>
                            {blockchain.toUpperCase()}
                        </span>
                    </div>
                    {painter && (
                        <div className="flex items-center justify-between pt-1 border-t border-orange-700/30">
                            <span className="text-xs text-orange-400">Painter</span>
                            <span className="text-xs font-mono text-green-400 bg-orange-800/50 px-2 py-0.5 rounded">
                                {shortPainter}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
