'use client';

import { useCanvasStore } from '@/lib/store';
import { COLORS, ColorIndex } from '@/lib/constants';

export default function PixelInfo() {
    const { hoverPosition, pixels } = useCanvasStore();

    if (!hoverPosition) {
        return (
            <div className="text-gray-400 text-sm">
                Hover over a pixel to see info
            </div>
        );
    }

    const { x, y } = hoverPosition;
    const colorIndex = pixels.get(`${x},${y}`) ?? 0;
    const color = COLORS[colorIndex as ColorIndex];

    return (
        <div className="flex items-center gap-3 text-sm">
            <div
                className="w-6 h-6 rounded border border-gray-600"
                style={{ backgroundColor: color }}
            />
            <div className="text-gray-300">
                <span className="font-mono">({x}, {y})</span>
                <span className="text-gray-500 ml-2">Color: {colorIndex}</span>
            </div>
        </div>
    );
}
