'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this exists or I'll simple class strings
// If utils doesn't exist, I'll stick to standard template literals, but it was in layout.tsx import.

// Mock function to generate a daily seed based on date
const getDailySeed = () => {
    const today = new Date();
    // Simple mock: Use date string to pick a "random" seed
    // In a real app, this would query the DB for a specific interesting seed
    const dateStr = today.toISOString().split('T')[0];
    const mockSeeds = ['87621', 'J8K32', 'WEE42', 'GROSS', 'HIGH7'];
    const seedIndex = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % mockSeeds.length;
    return mockSeeds[seedIndex];
};

export default function DailyWeePage() {
    const [seed, setSeed] = useState('');
    const [copied, setCopied] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        setSeed(getDailySeed());
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(seed);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    return (
        <main className="min-h-screen bg-balatro-bg text-balatro-white p-4 flex flex-col items-center pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md text-center mt-6 mb-8"
            >
                <h1 className="font-header text-5xl text-balatro-gold drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
                    THE DAILY WEE
                </h1>
                <p className="font-mono text-balatro-grey-light mt-2 text-lg">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </motion.div>

            {/* Seed Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="w-full max-w-md bg-balatro-grey border-2 border-balatro-silver-bright rounded-xl p-6 shadow-balatro-card relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-balatro-red" />

                <h2 className="font-header text-2xl text-center mb-4 text-balatro-white uppercase tracking-wider">
                    Today's Seed
                </h2>

                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="bg-balatro-black px-6 py-3 rounded-lg border border-balatro-grey-medium shadow-inner">
                        <span className="font-pixel text-4xl tracking-widest text-balatro-blue">
                            {seed}
                        </span>
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className="bg-balatro-blue hover:bg-balatro-blue-dark text-white p-3 rounded-lg transition-colors border-b-4 border-balatro-blue-dark active:border-b-0 active:translate-y-1"
                    >
                        {copied ? <Check size={24} /> : <Copy size={24} />}
                    </button>
                </div>

                <div className="bg-balatro-grey-dark/50 rounded-lg p-4 text-center border border-balatro-grey-medium">
                    <p className="font-mono text-balatro-silver-light text-sm mb-1 uppercase">Objective</p>
                    <p className="font-header text-xl text-balatro-white">Highest Wee Joker Chips</p>
                </div>
            </motion.div>

            {/* Screenshot Upload Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-md mt-8"
            >
                <h3 className="font-header text-xl text-balatro-silver-light mb-4 ml-2">
                    Submit Result
                </h3>

                <label className={cn(
                    "block w-full aspect-[4/3] rounded-xl border-4 border-dashed transition-all cursor-pointer relative overflow-hidden group",
                    selectedImage
                        ? "border-balatro-green bg-balatro-black"
                        : "border-balatro-grey-light hover:border-balatro-blue bg-balatro-grey/30 hover:bg-balatro-grey/50"
                )}>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                    />

                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Submission preview"
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-balatro-grey-light group-hover:text-balatro-blue transition-colors">
                            <Camera size={48} className="mb-2" />
                            <span className="font-header text-xl">Tap to Upload Screenshot</span>
                            <span className="font-mono text-sm opacity-70 mt-1">Proof required!</span>
                        </div>
                    )}
                </label>

                <button
                    disabled={!selectedImage}
                    className={cn(
                        "w-full mt-6 py-4 rounded-xl font-header text-2xl tracking-wide shadow-balatro-button transition-all border-b-4 active:border-b-0 active:translate-y-1 active:shadow-none",
                        selectedImage
                            ? "bg-balatro-green hover:bg-balatro-green-dark text-white border-balatro-green-dark"
                            : "bg-balatro-disabled text-balatro-disabled-light border-balatro-disabled-dark cursor-not-allowed"
                    )}
                >
                    SUBMIT WEE
                </button>
            </motion.div>
        </main>
    );
}
