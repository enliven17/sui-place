'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useCanvasStore } from '@/lib/store';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PIXEL_SIZE, COLORS, ColorIndex } from '@/lib/constants';

export default function Canvas({ onPixelClick }: { onPixelClick: (x: number, y: number) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(4);
    // Initialize offset to PIXEL_SIZE/2 (1) to align center of screen with center of a pixel (since 0 aligns with edge)
    const [offset, setOffset] = useState({ x: PIXEL_SIZE / 2, y: PIXEL_SIZE / 2 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
    const dragDistanceRef = useRef(0);
    const rawOffsetRef = useRef({ x: 0, y: 0 });

    const { pixels, isLoading, loadCanvas, setHoverPosition, hoverPosition, selectedColor } = useCanvasStore();

    // Calculate selection based on offset/scale (Center of screen)
    useEffect(() => {
        const centerX_canvas = (CANVAS_WIDTH * PIXEL_SIZE) / 2;
        const centerY_canvas = (CANVAS_HEIGHT * PIXEL_SIZE) / 2;

        // Calculate the displacement in Unscaled Canvas Pixels
        // Offset is in screen pixels (post-scale). 
        // A "drag right" (positive offset) means the view moves left relative to canvas, 
        // so we look at pixels to the LEFT of center.
        const deltaX = -offset.x / scale;
        const deltaY = -offset.y / scale;

        const targetX = centerX_canvas + deltaX;
        const targetY = centerY_canvas + deltaY;

        const gridX = Math.floor(targetX / PIXEL_SIZE);
        const gridY = Math.floor(targetY / PIXEL_SIZE);

        if (gridX >= 0 && gridX < CANVAS_WIDTH && gridY >= 0 && gridY < CANVAS_HEIGHT) {
            // Only update if changed to avoid loops/perf issues
            if (hoverPosition?.x !== gridX || hoverPosition?.y !== gridY) {
                setHoverPosition({ x: gridX, y: gridY });
            }
        } else {
            if (hoverPosition !== null) setHoverPosition(null);
        }
    }, [offset, scale, setHoverPosition, hoverPosition]);

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
        pixels.forEach((pixelData, key) => {
            const [x, y] = key.split(',').map(Number);
            ctx.fillStyle = COLORS[pixelData.color as ColorIndex];
            ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        });

        // Hover drawing REMOVED for performance. Now handled by DOM overlay.
    }, [pixels]);

    // Redraw on pixel changes
    useEffect(() => {
        drawCanvas();
    }, [drawCanvas]);

    // Handle mouse move for hover and pan
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isDragging) {
            const dx = e.clientX - lastMouse.x;
            const dy = e.clientY - lastMouse.y;

            // Accumulate drag distance to distinguish click vs drag
            dragDistanceRef.current += Math.abs(dx) + Math.abs(dy);

            // Update raw offset tracking
            rawOffsetRef.current.x += dx;
            rawOffsetRef.current.y += dy;

            // Snap logic:
            // Center of screen (0,0 offset) aligns with x=50, y=50 (Canvas coords).
            // x=50 is the boundary between pixel 24 (48-50) and pixel 25 (50-52).
            // To align with a pixel center (e.g. 51), we need an offset of -1 or +1 (Unscaled).
            // So valid offsets are Odd numbers: ..., -3, -1, 1, 3, ... (k * PIXEL_SIZE + PIXEL_SIZE/2)

            const snapToGrid = (val: number, s: number) => {
                const u = val / s; // Unscaled offset
                const halfPixel = PIXEL_SIZE / 2;
                // Formula: round((u - half) / size) * size + half
                const snappedU = Math.round((u - halfPixel) / PIXEL_SIZE) * PIXEL_SIZE + halfPixel;
                return snappedU * s;
            };

            const snappedX = snapToGrid(rawOffsetRef.current.x, scale);
            const snappedY = snapToGrid(rawOffsetRef.current.y, scale);

            // Apply limits
            // We want the center of the screen to ALWAYS be within the canvas bounds.
            // Max offset corresponds to the center being at x=0 or x=100.
            // So Max Offset = +/- (CanvasWidth / 2) * scale.
            // We subtract half a pixel (scaled) to stop exactly on the center of the last pixel.
            const maxOffsetX = (CANVAS_WIDTH * PIXEL_SIZE * scale) / 2 - (PIXEL_SIZE * scale) / 2;
            const maxOffsetY = (CANVAS_HEIGHT * PIXEL_SIZE * scale) / 2 - (PIXEL_SIZE * scale) / 2;

            setOffset({
                x: Math.max(-maxOffsetX, Math.min(maxOffsetX, snappedX)),
                y: Math.max(-maxOffsetY, Math.min(maxOffsetY, snappedY))
            });

            setLastMouse({ x: e.clientX, y: e.clientY });
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Mouse move logic for selection is REMOVED. Selection is now fixed to center.
    }, [scale, isDragging, lastMouse]);

    // Handle click (Place pixel at center selection OR pan to click)
    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        // If we dragged a significant amount, ignore this as a click
        if (dragDistanceRef.current > 5) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Calculate clicked pixel coordinate
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH);
        const y = Math.floor(((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT);

        // Bounds check
        if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) return;

        // If clicking the currently selected (centered) pixel, place it
        if (hoverPosition && hoverPosition.x === x && hoverPosition.y === y) {
            onPixelClick(hoverPosition.x, hoverPosition.y);
        } else {
            // Otherwise, pan to center that pixel
            const centerX_canvas = (CANVAS_WIDTH * PIXEL_SIZE) / 2;
            const centerY_canvas = (CANVAS_HEIGHT * PIXEL_SIZE) / 2;

            const targetX = (x + 0.5) * PIXEL_SIZE;
            const targetY = (y + 0.5) * PIXEL_SIZE;

            const newOffsetX = (centerX_canvas - targetX) * scale;
            const newOffsetY = (centerY_canvas - targetY) * scale;

            setOffset({ x: newOffsetX, y: newOffsetY });
        }
    }, [isDragging, hoverPosition, onPixelClick, scale]);

    // Handle wheel for zoom
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.95 : 1.05;

        // Capture the currently centered pixel BEFORE changing scale
        // This uses the same calculation as the selection useEffect
        const centerX_canvas = (CANVAS_WIDTH * PIXEL_SIZE) / 2;
        const centerY_canvas = (CANVAS_HEIGHT * PIXEL_SIZE) / 2;

        // Calculate current centered pixel from current offset and scale
        const currentDeltaX = -offset.x / scale;
        const currentDeltaY = -offset.y / scale;
        const currentTargetX = centerX_canvas + currentDeltaX;
        const currentTargetY = centerY_canvas + currentDeltaY;
        const currentGridX = Math.floor(currentTargetX / PIXEL_SIZE);
        const currentGridY = Math.floor(currentTargetY / PIXEL_SIZE);

        // Calculate the center of this pixel (in canvas coordinates)
        const pixelCenterX = (currentGridX + 0.5) * PIXEL_SIZE;
        const pixelCenterY = (currentGridY + 0.5) * PIXEL_SIZE;

        setScale(prevScale => {
            const newScale = Math.max(1, Math.min(40, prevScale * delta));

            // Calculate the new offset needed to keep the SAME pixel centered
            // Formula: offset = (centerX_canvas - pixelCenterX) * newScale
            const newOffsetX = (centerX_canvas - pixelCenterX) * newScale;
            const newOffsetY = (centerY_canvas - pixelCenterY) * newScale;

            // Apply strict limits
            const maxOffsetX = (CANVAS_WIDTH * PIXEL_SIZE * newScale) / 2 - (PIXEL_SIZE * newScale) / 2;
            const maxOffsetY = (CANVAS_HEIGHT * PIXEL_SIZE * newScale) / 2 - (PIXEL_SIZE * newScale) / 2;

            const clampedX = Math.max(-maxOffsetX, Math.min(maxOffsetX, newOffsetX));
            const clampedY = Math.max(-maxOffsetY, Math.min(maxOffsetY, newOffsetY));

            // Update raw ref to match
            rawOffsetRef.current = { x: clampedX, y: clampedY };

            // Set offset directly (not using setOffset callback as we're already in setScale callback)
            setOffset({ x: clampedX, y: clampedY });

            return newScale;
        });
    }, [offset, scale]);

    // Mouse down/up for panning
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Allow left click drag effectively everywhere if checks pass, 
        // but typically we might want left-click to simple-click if no movement?
        // Current logic: Middle or Shift+Left to drag.
        // User wants "scrolling moves screen". Usually on mobile/modern web apps, 
        // just Dragging the background (Left Click) pans the view.
        // Let's enable Left Click Drag by default for better UX with this "center selection" model.

        if (e.button === 0 || e.button === 1) {
            setIsDragging(true);
            setLastMouse({ x: e.clientX, y: e.clientY });
            dragDistanceRef.current = 0;
            // Sync raw offset with current snapped offset state at start of drag
            rawOffsetRef.current = { x: offset.x, y: offset.y };
        }
    }, [offset]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseLeave = useCallback(() => {
        // No longer clearing hover position on leave, as selection is camera-based
        setIsDragging(false);
    }, []);

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
            className="overflow-hidden w-full h-full flex items-center justify-center bg-gray-900 relative"
            onWheel={handleWheel}
        >
            {/* Crosshair Overlay */}
            <div
                className={`absolute pointer-events-none z-20 flex items-center justify-center p-0.5 transition-opacity duration-200 ${hoverPosition ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    width: Math.max(4, PIXEL_SIZE * scale + 4), // slightly larger than pixel
                    height: Math.max(4, PIXEL_SIZE * scale + 4),
                }}
            >
                {/* Top Left Corner */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-black shadow-sm"></div>
                {/* Top Right Corner */}
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-black shadow-sm"></div>
                {/* Bottom Left Corner */}
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-black shadow-sm"></div>
                {/* Bottom Right Corner */}
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-black shadow-sm"></div>

                {/* Optional Center Dot or extra styling could go here */}

                {/* Ghost Pixel Preview (Center) */}
                <div
                    className="absolute z-[-1]"
                    style={{
                        width: PIXEL_SIZE * scale,
                        height: PIXEL_SIZE * scale,
                        backgroundColor: COLORS[selectedColor],
                        opacity: 0.5,
                        boxShadow: '0 0 10px rgba(0,0,0,0.3)'
                    }}
                />
            </div>

            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH * PIXEL_SIZE}
                height={CANVAS_HEIGHT * PIXEL_SIZE}
                style={{
                    transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
                    imageRendering: 'pixelated',
                    cursor: isDragging ? 'grabbing' : 'default', // Using default (arrow) for better visibility
                    touchAction: 'none',
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
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
