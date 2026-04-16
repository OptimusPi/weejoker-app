import Link from 'next/link';
import { Sprite } from '@/components/Sprite';
import { cn } from '@/lib/utils';

export default function WeJokerPage() {
    const variants = [
        {
            id: 'TheDailyWee',
            name: 'The Daily Wee',
            description: 'The original daily ritual. Find the Wee Joker.',
            icon: 'Wee Joker',
            color: 'bg-[var(--balatro-blue)]',
            href: '/'
        },
        {
            id: 'cloud9',
            name: 'Cloud 9 Daily',
            description: 'Float like a butterfly, sting like a Rank 9.',
            icon: 'Cloud 9',
            color: 'bg-[var(--balatro-purple)]',
            href: '/cloud9'
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--balatro-black)] text-white font-pixel p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-6xl font-header text-white drop-shadow-md mb-4">
                        WE <span className="text-[var(--balatro-red)]">JOKER</span>
                    </h1>
                    <p className="text-xl text-white/60 font-header tracking-wider">
                        Community Rituals & Variants
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {variants.map(variant => (
                        <Link 
                            key={variant.id}
                            href={variant.href}
                            className="group relative overflow-hidden rounded-xl border-4 border-white/10 hover:border-white/40 transition-all hover:-translate-y-1 hover:shadow-2xl bg-black/40"
                        >
                            <div className={cn("absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20", variant.color)} />
                            
                            <div className="relative p-8 flex flex-col items-center text-center gap-6">
                                <div className="transform transition-transform group-hover:scale-110 duration-300">
                                    <Sprite name={variant.icon} width={96} />
                                </div>
                                
                                <div>
                                    <h2 className="text-3xl font-header text-white mb-2">{variant.name}</h2>
                                    <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
                                        {variant.description}
                                    </p>
                                </div>

                                <div className="px-6 py-2 rounded bg-white/10 group-hover:bg-white/20 transition-colors uppercase tracking-widest text-sm">
                                    Play Now
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* Placeholder for future community submissions */}
                    <Link 
                        href="/create"
                        className="group relative overflow-hidden rounded-xl border-4 border-dashed border-white/10 hover:border-white/20 transition-all bg-black/20 flex flex-col items-center justify-center p-8 gap-4"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                            +
                        </div>
                        <span className="font-header text-xl text-white/40 group-hover:text-white/60">
                            Submit Your Own
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
