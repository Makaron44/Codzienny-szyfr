import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Tile = ({ value, status, delay = 0 }) => {
  const colors = {
    correct: 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    present: 'bg-amber-500 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    absent: 'bg-slate-700/50 border-slate-600 text-slate-400',
    empty: 'bg-white/5 border-white/10 text-white',
    active: 'bg-white/10 border-white/30 text-white scale-105 shadow-[0_0_10px_rgba(255,255,255,0.1)]'
  };

  const currentStatus = status || (value ? 'active' : 'empty');

  return (
    <motion.div
      initial={status ? { rotateX: 0 } : { scale: 1 }}
      animate={status ? { 
        rotateX: [0, 90, 0],
        transition: { delay, duration: 0.5 }
      } : value ? {
        scale: [1, 1.1, 1],
        transition: { duration: 0.1 }
      } : {}}
      className={cn(
        "w-14 h-14 sm:w-16 sm:h-16 border-2 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-bold transition-all duration-300",
        colors[currentStatus]
      )}
    >
      <motion.span
        initial={status ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ delay: status ? delay + 0.25 : 0 }}
      >
        {value}
      </motion.span>
    </motion.div>
  );
};

export default Tile;
export { cn };
