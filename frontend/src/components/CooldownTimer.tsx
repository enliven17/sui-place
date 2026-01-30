'use client';

import { useEffect, useState } from 'react';
import { useCanvasStore } from '@/lib/store';
import { COOLDOWN_MS } from '@/lib/constants';

export default function CooldownTimer() {
    const { cooldownEnd } = useCanvasStore();
    const [remaining, setRemaining] = useState(0);

    useEffect(() => {
        if (!cooldownEnd) {
            setRemaining(0);
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            if (now >= cooldownEnd) {
                setRemaining(0);
            } else {
                setRemaining(Math.ceil((cooldownEnd - now) / 1000));
            }
        }, 100);

        return () => clearInterval(interval);
    }, [cooldownEnd]);

    if (remaining === 0) {
        return (
            <div className="text-green-400 text-sm font-medium">
                ✓ Ready to place
            </div>
        );
    }

    const progress = ((COOLDOWN_MS / 1000 - remaining) / (COOLDOWN_MS / 1000)) * 100;

    return (
        <div className="w-32">
            <div className="text-orange-400 text-sm font-medium mb-1">
                Wait {remaining}s
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-orange-500 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
