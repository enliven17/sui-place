'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useCanvasStore } from '@/lib/store';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PIXEL_SIZE, COLORS, ColorIndex } from '@/lib/constants';

export default function Canvas({ onPixelClick }: { onPixelClick: (x: number, y: number) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(4);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

    const { pixels, isLoading, loadCanvas, setHoverPosition, hoverPosition, selectedColor } = useCanvasStore();

    // Load canvas on mount
    useEffect(() => {
        loadCanvas();
    }, [loadCanvas]);

    // Draw canvas
    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = COLORS[0]; // White background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw all pixels
        pixels.forEach((colorIndex, key) => {
            const [x, y] = key.split(',').map(Number);
            ctx.fillStyle = COLORS[colorIndex as ColorIndex];
            ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        });

        // Draw hover indicator
        if (hoverPosition) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                hoverPosition.x * PIXEL_SIZE,
                hoverPosition.y * PIXEL_SIZE,
                PIXEL_SIZE,
                PIXEL_SIZE
            );
            // Preview selected color
            ctx.fillStyle = COLORS[selectedColor];
            ctx.globalAlpha = 0.5;
            ctx.fillRect(
                hoverPosition.x * PIXEL_SIZE,
                hoverPosition.y * PIXEL_SIZE,
                PIXEL_SIZE,
                PIXEL_SIZE
            );
            ctx.globalAlpha = 1;
        }
    }, [pixels, hoverPosition, selectedColor]);

    // Redraw on pixel changes
    useEffect(() => {
        drawCanvas();
    }, [drawCanvas]);

    // Handle mouse move for hover and pan
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isDragging) {
            const dx = e.clientX - lastMouse.x;
            const dy = e.clientY - lastMouse.y;

            setOffset(prev => {
                const newX = prev.x + dx;
                const newY = prev.y + dy;

                // Pan limits - keep at least some part of canvas visible
                // Limit offset to roughly +/- canvas_size/2
                const limitX = (CANVAS_WIDTH * PIXEL_SIZE * scale) / 1.5;
                const limitY = (CANVAS_HEIGHT * PIXEL_SIZE * scale) / 1.5;

                return {
                    x: Math.max(-limitX, Math.min(limitX, newX)),
                    y: Math.max(-limitY, Math.min(limitY, newY))
                };
            });

            setLastMouse({ x: e.clientX, y: e.clientY });
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        // Adjust coordinate calculation for scale and pan
        // We need to inverse the transform: (client - rect - offset) / scale
        // But since checking hover on untransformed logic inside canvas pixel grid
        const x = Math.floor((e.clientX - rect.left) / (PIXEL_SIZE * scale));
        const y = Math.floor((e.clientY - rect.top) / (PIXEL_SIZE * scale));

        if (x >= 0 && x < CANVAS_WIDTH && y >= 0 && y < CANVAS_HEIGHT) {
            setHoverPosition({ x, y });
        } else {
            setHoverPosition(null);
        }
    }, [scale, isDragging, lastMouse, setHoverPosition]);

    // Handle click
    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isDragging) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / (PIXEL_SIZE * scale));
        const y = Math.floor((e.clientY - rect.top) / (PIXEL_SIZE * scale));

        if (x >= 0 && x < CANVAS_WIDTH && y >= 0 && y < CANVAS_HEIGHT) {
            onPixelClick(x, y);
        }
    }, [scale, isDragging, onPixelClick]);

    // Handle wheel for zoom
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        // Limit zoom out to 1x and zoom in to 20x
        setScale(prev => Math.max(1, Math.min(20, prev * delta)));
    }, []);

    // Mouse down/up for panning
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.shiftKey)) { // Middle click or shift+click
            setIsDragging(true);
            setLastMouse({ x: e.clientX, y: e.clientY });
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHoverPosition(null);
        setIsDragging(false);
    }, [setHoverPosition]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="overflow-hidden w-full h-full flex items-center justify-center bg-gray-900"
            onWheel={handleWheel}
        >
            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH * PIXEL_SIZE}
                height={CANVAS_HEIGHT * PIXEL_SIZE}
                style={{
                    transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
                    imageRendering: 'pixelated',
                    cursor: isDragging ? 'grabbing' : 'crosshair',
                    touchAction: 'none',
                }}
                className="border border-gray-700 shadow-2xl"
                onMouseMove={handleMouseMove}
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            />
        </div>
    );
}
