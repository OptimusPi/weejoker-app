"use client";

import { useMemo } from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { SeedData } from '@/lib/types';
import { motion } from 'framer-motion';

interface SeedScatterPlotProps {
    data: SeedData[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-balatro-panel border-2 border-white p-3 rounded shadow-xl z-50">
                <p className="font-header text-balatro-blue text-lg">{data.seed}</p>
                <p className="font-pixel text-white">Score: <span className="text-balatro-gold">{data.run_score}</span></p>
                <p className="font-pixel text-zinc-400">Rank 2s: {data.rank_2_count}</p>
                {data.joker_edition && (
                    <p className="text-xs font-header text-balatro-red uppercase mt-1 animate-pulse">{data.joker_edition}</p>
                )}
            </div>
        );
    }
    return null;
};

export function SeedScatterPlot({ data }: SeedScatterPlotProps) {
    // Only visualize top 200 to prevent lag, or ensure the parent limits it
    const chartData = useMemo(() => {
        return data.slice(0, 500).map(s => ({
            ...s,
            // Add slight jitter to avoid total overlap
            jittered_rank: (s.rank_2_count || 0) + (Math.random() - 0.5) * 0.5,
            run_score: s.run_score || 0
        }));
    }, [data]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-[400px] bg-black/40 border-2 border-white/10 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm"
        >
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-balatro-gold font-header text-xl uppercase drop-shadow-md">Seed Distribution</h3>
                <p className="text-zinc-500 font-pixel text-sm">Rank 2 Count vs. Target Score</p>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis
                        type="number"
                        dataKey="jittered_rank"
                        name="Rank 2 Count"
                        domain={['auto', 'auto']}
                        stroke="#94a3b8"
                        tick={{ fontFamily: 'm6x11plusplus', fontSize: 12 }}
                        label={{ value: 'Rank 2 Count', position: 'bottom', fill: '#64748b', fontSize: 12, fontFamily: 'm6x11plusplus' }}
                    />
                    <YAxis
                        type="number"
                        dataKey="run_score"
                        name="Score"
                        stroke="#94a3b8"
                        tick={{ fontFamily: 'm6x11plusplus', fontSize: 12 }}
                        label={{ value: 'Target Score', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12, fontFamily: 'm6x11plusplus' }}
                    />
                    <ZAxis type="number" range={[50, 400]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Seeds" data={chartData} fill="#8884d8">
                        {chartData.map((entry, index) => {
                            let color = "#ef4444"; // Default Red
                            if (entry.joker_hack) color = "#3b82f6"; // Blue for Hack
                            if (entry.joker_wee && entry.joker_hack) color = "#a855f7"; // Purple for Synergy
                            if (entry.rank_2_count && entry.rank_2_count > 15) color = "#eab308"; // Gold for heavy distributions

                            return <Cell key={`cell-${index}`} fill={color} fillOpacity={0.7} stroke="white" strokeWidth={1} />;
                        })}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
