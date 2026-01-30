"use client";

import React, { useEffect, useRef } from 'react';

export const SwirlBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        // Balatro Colors
        const color1 = { h: 360, s: 60, l: 30 }; // Red
        const color2 = { h: 210, s: 70, l: 40 }; // Blue

        const render = () => {
            time += 0.005;
            const { width, height } = canvas;

            // Clear with deep dark slate
            ctx.fillStyle = '#1e2425';
            ctx.fillRect(0, 0, width, height);

            // Create swirls
            for (let i = 0; i < 3; i++) {
                const layerTime = time + i * 2;
                const gradient = ctx.createRadialGradient(
                    width / 2 + Math.cos(layerTime) * width * 0.3,
                    height / 2 + Math.sin(layerTime * 0.7) * height * 0.2,
                    0,
                    width / 2 + Math.cos(layerTime) * width * 0.3,
                    height / 2 + Math.sin(layerTime * 0.7) * height * 0.2,
                    width * 0.8
                );

                const hue = i % 2 === 0 ? color1.h : color2.h;
                gradient.addColorStop(0, `hsla(${hue}, 80%, 30%, 0.3)`);
                gradient.addColorStop(1, 'transparent');

                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            }

            // Draw fine noise/texture
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            for (let j = 0; j < 10; j++) {
                ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none opacity-40 mix-blend-screen"
            style={{ filter: 'blur(30px) contrast(1.2)' }}
        />
    );
};
