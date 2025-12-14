
import { SlidersHorizontal, Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
    onSearch: (query: string) => void;
    onSortChange: (sort: string) => void;
}

export function FilterBar({ onSearch, onSortChange }: FilterBarProps) {
    return (
        <div className="flex flex-col md:flex-row gap-6 mb-12 p-4 balatro-panel border-4 border-balatro-grey-light bg-balatro-bg relative">
            {/* Search Section */}
            <div className="flex-1 relative">
                <div className="absolute -top-5 left-4 bg-balatro-red text-white px-3 py-1 rounded-md text-sm font-header uppercase tracking-wider shadow-md z-10 border-2 border-balatro-red-dark">
                    Search Seeds
                </div>
                <div className="relative mt-2">
                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none z-10 text-balatro-blue">
                        <Search size={24} strokeWidth={3} />
                    </div>
                    <input
                        type="text"
                        placeholder="ENTER SEED..."
                        className="w-full pl-12 pr-4 py-4 bg-balatro-grey-darker border-b-4 border-balatro-grey-light rounded-lg text-white font-header text-2xl placeholder:text-balatro-grey-light/40 focus:outline-none focus:border-balatro-blue focus:bg-black/80 transition-all shadow-inner uppercase tracking-widest"
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Sort Section */}
            <div className="flex gap-4 items-end">
                <div className="relative flex-grow md:flex-grow-0">
                    <div className="absolute -top-5 left-4 bg-balatro-red text-white px-3 py-1 rounded-md text-sm font-header uppercase tracking-wider shadow-md z-10 border-2 border-balatro-red-dark">
                        Sort By
                    </div>
                    <div className="relative mt-2 h-full">
                        <select
                            onChange={(e) => onSortChange(e.target.value)}
                            className="bg-balatro-orange hover:bg-balatro-orange-dark text-white border-b-4 border-[#a05b00] active:border-b-0 active:translate-y-1 rounded-lg font-header text-xl shadow-[0_4px_0_0_rgba(0,0,0,0.4)] appearance-none cursor-pointer uppercase tracking-wider py-4 pl-6 pr-12 w-full md:w-64 text-center transition-all focus:outline-none"
                        >
                            <option value="default">Most Rated</option>
                            <option value="wee_desc">Wee Joker</option>
                            <option value="hack_desc">Hack Potential</option>
                            <option value="hearts_desc">Twos Count</option>
                            <option value="spades_desc">Score</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 pointer-events-none opacity-80">
                            <ArrowUpDown size={20} absoluteStrokeWidth />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
