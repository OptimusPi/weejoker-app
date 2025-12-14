
import dynamic from "next/dynamic";
import { PastWeekResults } from "@/components/PastWeekResults";

// December 12th, 2025 (Project Zero Point) - set one day early so Math.floor is 1-indexed naturally
const WEEPOCH = new Date('2025-12-12').getTime();
import { ClientDailyWeeLoader } from "@/components/ClientDailyWeeLoader";



export default function Home() {
    return (
        <main className="min-h-screen py-10">


            {/* HERO: The Daily Wee */}
            <div className="flex flex-col items-center justify-center p-8 bg-black/40 rounded-xl border-4 border-white/20 mt-12 mb-12 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl text-white mb-2" style={{ fontFamily: 'm6x11plusplus' }}>
                    THE DAILY WEE
                </h1>
                <span className="text-xl text-blue-400" style={{ fontFamily: 'm6x11plusplus' }}>
                    No. {Math.floor((Date.now() - WEEPOCH) / (1000 * 60 * 60 * 24))}
                </span>
            </div>

            <div className="container mx-auto px-4 mb-12">
                <ClientDailyWeeLoader />
            </div>

            {/* Past Week Results */}
            <div className="container mx-auto px-4 mb-12">
                <PastWeekResults />
            </div>
        </main>
    );
}
