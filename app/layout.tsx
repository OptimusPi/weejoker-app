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
    title: 'The Daily Wee',
    description: 'A daily ritual game revolving around Wee Joker appreciation.',
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
                    <footer className="w-full py-4 text-center text-white/20 font-pixel text-[10px] uppercase tracking-widest pointer-events-none fixed bottom-0 z-0">
                        <p>
                            Not affiliated with LocalThunk or PlayStack. • <a href="https://store.steampowered.com/app/2379780/Balatro/" target="_blank" className="hover:text-white/40 pointer-events-auto transition-colors">BUY BALATRO</a> • Created with ❤️ for the Balatro community.
                        </p>
                    </footer>
                </div>
            </body>
        </html>
    );
}
