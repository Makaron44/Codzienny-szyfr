import React from 'react';
import { motion } from 'framer-motion';

const StatsChart = ({ distribution, maxGuesses }) => {
  const maxValue = Math.max(...Object.values(distribution), 1);

  return (
    <div className="w-full space-y-2 py-4">
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 text-center">Rozkład wygranych</h4>
      {Array.from({ length: maxGuesses }).map((_, i) => {
        const guessCount = i + 1;
        const value = distribution[guessCount] || 0;
        const width = (value / maxValue) * 100;

        return (
          <div key={guessCount} className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 w-2">{guessCount}</span>
            <div className="flex-grow bg-white/5 rounded-full h-5 overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(width, 8)}%` }}
                className={`h-full flex items-center justify-end px-2 text-[10px] font-black text-white ${
                  width > 0 ? "bg-emerald-500" : "bg-slate-800"
                }`}
              >
                {value}
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsChart;
