'use client';

import { useCanvasStore } from '@/lib/store';
import { COLORS, ColorIndex } from '@/lib/constants';

export default function ColorPicker() {
    const { selectedColor, setSelectedColor } = useCanvasStore();

    return (
        <div className="flex flex-wrap gap-1 p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg">
            {COLORS.map((color, index) => (
                <button
                    key={index}
                    onClick={() => setSelectedColor(index as ColorIndex)}
                    className={`w-8 h-8 rounded-md transition-all duration-150 ${selectedColor === index
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-110'
                            : 'hover:scale-105'
                        }`}
                    style={{ backgroundColor: color }}
                    title={`Color ${index}`}
                />
            ))}
        </div>
    );
}
