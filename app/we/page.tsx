import Link from 'next/link';
import { Sprite } from '@/components/Sprite';
import { JimboPanel, JimboInnerPanel, JimboButton } from '@/components/JimboPanel';

export default function WeJokerPage() {
    const variants = [
        {
            id: 'TheDailyWee',
            name: 'The Daily Wee',
            description: 'The original daily ritual. Find the Wee Joker.',
            icon: 'Wee Joker',
            color: 'var(--jimbo-blue)',
            href: '/'
        },
        {
            id: 'cloud9',
            name: 'Cloud 9 Daily',
            description: 'Float like a butterfly, sting like a Rank 9.',
            icon: 'Cloud 9',
            color: 'var(--jimbo-purple)',
            href: '/cloud9'
        }
    ];

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-header text-white mb-2">
                        WE <span className="text-[var(--jimbo-red)]">JOKER</span>
                    </h1>
                    <p className="text-lg font-header tracking-wider text-[var(--jimbo-grey)]">
                        Community Rituals & Variants
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {variants.map(variant => (
                        <Link key={variant.id} href={variant.href} className="group">
                            <JimboPanel className="hover:scale-[1.02] transition-transform duration-150">
                                <div className="flex flex-col items-center text-center gap-4 p-4">
                                    <div className="transform transition-transform group-hover:scale-110 duration-300">
                                        <Sprite name={variant.icon} width={96} />
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-header text-white mb-1">{variant.name}</h2>
                                        <p className="text-sm text-[var(--jimbo-grey)] leading-relaxed max-w-xs mx-auto">
                                            {variant.description}
                                        </p>
                                    </div>

                                    <JimboInnerPanel className="px-6 py-2 text-sm tracking-widest text-[var(--jimbo-border-silver)]">
                                        Play Now
                                    </JimboInnerPanel>
                                </div>
                            </JimboPanel>
                        </Link>
                    ))}

                    {/* Create your own */}
                    <Link href="/create" className="group">
                        <JimboPanel className="h-full border-dashed hover:scale-[1.02] transition-transform duration-150">
                            <div className="flex flex-col items-center justify-center p-8 gap-4 h-full">
                                <div className="w-16 h-16 rounded-full bg-[var(--jimbo-panel-edge)] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform text-[var(--jimbo-grey)]">
                                    +
                                </div>
                                <span className="font-header text-xl text-[var(--jimbo-grey)] group-hover:text-white transition-colors">
                                    Create Your Own
                                </span>
                            </div>
                        </JimboPanel>
                    </Link>
                </div>
            </div>
        </div>
    );
}
