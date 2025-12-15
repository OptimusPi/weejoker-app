
import dynamic from "next/dynamic";
import { PastWeekResults } from "@/components/PastWeekResults";

// December 12th, 2025 (Project Zero Point)
import { ClientDailyWeeLoader } from "@/components/ClientDailyWeeLoader";



export default function Home() {
    return (
        <main className="min-h-screen py-10">




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
