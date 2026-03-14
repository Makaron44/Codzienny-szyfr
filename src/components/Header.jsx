import { CircleHelp, BarChart3, Settings, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = ({ onHelp, onStats, onSettings }) => {
  return (
    <header className="w-full max-w-2xl mx-auto flex items-center justify-between p-4 sm:p-6 relative z-20">
      <div className="flex items-center gap-2">
        <motion.button 
          whileHover={{ rotate: -10 }}
          whileTap={{ scale: 0.9 }}
          onClick={onHelp}
          className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/10"
        >
          <CircleHelp size={22} />
        </motion.button>
      </div>

      <div className="flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 mb-1"
        >
           <Zap size={14} className="text-emerald-400 fill-emerald-400" />
           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] leading-none">Pro</span>
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white drop-shadow-2xl">
          SZYFR
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onStats}
          className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/10"
        >
          <BarChart3 size={22} />
        </motion.button>
        <motion.button 
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onSettings}
          className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/10"
        >
          <Settings size={22} />
        </motion.button>
      </div>
    </header>
  );
};

export default Header;
