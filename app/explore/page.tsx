import NavBar from '@/components/NavBar';
import { PageFooter } from '@/components/PageFooter';

export default function ExplorePage() {
    return (
        <div className="flex flex-col min-h-screen bg-[var(--balatro-black)]">
            <NavBar />
            <main className="flex flex-1 items-center justify-center text-white/30 font-pixel text-xs">
                Ice Lake coming soon
            </main>
            <PageFooter />
        </div>
    );
}
