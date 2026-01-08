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

                    <footer className="balatro-footer">
                        <p className="balatro-footer-text">
                            NOT AFFILIATED WITH LOCALTHUNK OR <a href="https://www.playstack.com/games/balatro/" target="_blank" className="hover:text-white underline decoration-white/20 underline-offset-2">PLAYSTACK</a> • <a href="https://playbalatro.com/" target="_blank" className="hover:text-white underline decoration-white/20 underline-offset-2 text-[var(--balatro-gold)]">BUY BALATRO</a> • CREATED WITH <span className="text-[var(--balatro-red)] mx-1 juice-heart">❤</span> FOR THE BALATRO COMMUNITY
                        </p>
                    </footer>

                </div>
            </body>
        </html>
    );
}
