import { Delete, CornerDownLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from './Tile';

const Keyboard = ({ onKey, onDelete, onEnter, usedKeys }) => {
  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['ENTER', '0', 'DELETE']
  ];

  const getKeyStatus = (key) => {
    if (!usedKeys[key]) return 'default';
    return usedKeys[key];
  };

  const statusColors = {
    correct: 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    present: 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)]',
    absent: 'bg-slate-900 text-slate-500 opacity-50',
    default: 'bg-slate-800/80 text-white hover:bg-slate-700 active:scale-95'
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-2 px-2 pb-4">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-2">
          {row.map((key) => {
            const isSpecial = key === 'ENTER' || key === 'DELETE';
            const status = getKeyStatus(key);
            
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (key === 'ENTER') onEnter();
                  else if (key === 'DELETE') onDelete();
                  else onKey(key);
                }}
                className={cn(
                  "flex-1 h-14 sm:h-16 rounded-xl font-bold flex items-center justify-center transition-all duration-200 border border-white/5",
                  isSpecial ? "flex-[1.5] text-xs sm:text-sm" : "text-xl sm:text-2xl",
                  statusColors[status]
                )}
              >
                {key === 'DELETE' ? <Delete size={24} /> : 
                 key === 'ENTER' ? <span className="flex items-center gap-1 uppercase tracking-widest"><CornerDownLeft size={16} /> Enter</span> : 
                 key}
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
