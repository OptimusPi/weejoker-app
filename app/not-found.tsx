"use client";

import Link from 'next/link';
import { Sprite } from '@/components/Sprite';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="jimbo-panel max-w-lg w-full flex flex-col items-center gap-6 py-12">
                {/* 404 Header */}
                <div className="relative">
                    <Sprite name="Joker" width={120} className="animate-bounce-slow" />
                    <div className="absolute -top-4 -right-4 bg-[var(--jimbo-red)] text-white font-header text-4xl px-4 py-1 rounded-sm shadow-lg rotate-12 transform-gpu border-2 border-[var(--jimbo-panel-edge)]">
                        404
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="font-header text-5xl text-white uppercase tracking-widest drop-shadow-md">
                        Page Not Found
                    </h1>
                    <p className="font-pixel text-[var(--jimbo-blue)] text-lg uppercase tracking-wider">
                        Something went wrong during the ritual...
                    </p>
                </div>

                <div className="w-full h-px bg-white/10 my-2" />

                {/* Secret Link Section */}
                <div className="space-y-4 w-full px-4">
                    <p className="font-header text-xl text-[var(--jimbo-gold)] uppercase tracking-widest">
                        Did you mean these?
                    </p>

                    <div className="flex flex-col gap-3">
                        <Link
                            href="/jaml-uiv2"
                            className="jimbo-btn jimbo-btn-gold w-full group !py-4 transition-all hover:scale-[1.02]"
                        >
                            <span className="flex items-center gap-4">
                                <span className="text-xl">JAML IDE (v2.0)</span>
                                <Sprite name="Brainstorm" width={28} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                            </span>
                        </Link>

                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                href="/jaml-builder"
                                className="jimbo-btn jimbo-btn-blue !text-sm !py-2 hover:scale-[1.02] transition-transform"
                            >
                                JAML Builder
                            </Link>
                            <Link
                                href="/seed-viewer"
                                className="jimbo-btn jimbo-btn-green !text-sm !py-2 hover:scale-[1.02] transition-transform"
                            >
                                Seed Viewer
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <Link
                        href="/"
                        className="jimbo-btn jimbo-btn-red !text-2xl animate-pulse hover:scale-110 active:scale-95 transition-all w-full"
                    >
                        Return Home
                    </Link>
                </div>
            </div>

            <div className="mt-8 font-pixel text-white/20 text-xs uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Error Code: DEADBEEF-404
            </div>
        </div>
    );
}
