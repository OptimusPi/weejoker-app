import type { Metadata } from 'next';
import './globals.css';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BackgroundShader } from '@/components/BackgroundShader';

import localFont from 'next/font/local';

const fontHeader = localFont({
    src: '../public/fonts/m6x11plusplus.otf',
    variable: '--font-header',
    display: 'swap',
});

const fontPixel = localFont({
    src: '../public/fonts/m6x11plusplus.otf',
    variable: '--font-pixel',
    display: 'swap',
});

const fontSans = Outfit({
    subsets: ['latin'],
    variable: '--font-sans',
});

const fontMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
});

export const metadata: Metadata = {
    title: 'The Daily Wee | Balatro Seed Hunter',
    description: 'Find the perfect Balatro seeds.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                suppressHydrationWarning
                className={cn(
                    'min-h-screen font-sans antialiased overflow-x-hidden text-white',
                    fontSans.variable,
                    fontMono.variable,
                    fontHeader.variable,
                    fontPixel.variable
                )}
            >
                <BackgroundShader />

                <div className="relative z-10 min-h-screen flex flex-col">

                    <main className="flex-grow">
                        {children}
                    </main>
                    <footer className="py-12 text-center text-white/60 space-y-6 bg-black/40 backdrop-blur-md">
                        <p className="font-pixel text-lg">
                            Not affiliated with LocalThunk or PlayStack.
                        </p>
                        <a
                            href="https://www.playbalatro.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-[#FF4D4D] hover:bg-[#C0392B] text-white font-header text-xl px-8 py-3 rounded shadow-[0_4px_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 transition-all border-2 border-white/20 hover:border-white"
                        >
                            BUY BALATRO
                        </a>
                        <p className="font-pixel text-sm opacity-80">
                            Created with ❤️ for the Balatro community.
                        </p>
                    </footer>
                </div>
            </body>
        </html>
    );
}
