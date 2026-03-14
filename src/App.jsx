import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Row from './components/Row';
import Keyboard from './components/Keyboard';
import AnimatedBackground from './components/AnimatedBackground';
import StatsChart from './components/StatsChart';
import { useGame } from './hooks/useGame';
import { useSound } from './hooks/useSound';
import { useAchievements } from './hooks/useAchievements';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Award, Info, Settings as SettingsIcon, Zap, Play, RotateCcw, Timer, Trash2 } from 'lucide-react';
import { cn } from './components/Tile';

// Pomocniczy komponent Modala
const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-indigo-500" />
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black tracking-tight text-white uppercase italic">{title}</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

function App() {
  const {
    wordLength,
    maxGuesses,
    guesses,
    evaluations,
    status,
    currentGuess,
    addDigit,
    removeDigit,
    submitGuess,
    changeDifficulty,
    targetCode,
    isHardMode,
    toggleHardMode,
    isTraining,
    startTraining,
    stopTraining,
    stats,
    lastGame,
    resetStats
  } = useGame();

  const { click, error, submit, win } = useSound();
  const { allAchievements, unlockedIds } = useAchievements(stats, lastGame);
  const [activeModal, setActiveModal] = useState(null); // 'help', 'stats', 'settings'
  const [invalidGuess, setInvalidGuess] = useState(false);
  const [toast, setToast] = useState(null);
  const [timeToNext, setTimeToNext] = useState('');
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  // Licznik czasu
  useEffect(() => {
    const timer = setInterval(() => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const diff = tomorrow - now;
        const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        
        setTimeToNext(`${hours}:${mins}:${secs}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg) => {
      setToast(msg);
      setTimeout(() => setToast(null), 3000);
  };

  const usedKeys = useMemo(() => {
    const map = {};
    guesses.forEach((guess, i) => {
      const evaluation = evaluations[i];
      guess.split('').forEach((char, j) => {
        const currentStatus = evaluation[j];
        const bestStatus = map[char];

        if (currentStatus === 'correct') {
          map[char] = 'correct';
        } else if (currentStatus === 'present' && bestStatus !== 'correct') {
          map[char] = 'present';
        } else if (currentStatus === 'absent' && !bestStatus) {
          map[char] = 'absent';
        }
      });
    });
    return map;
  }, [guesses, evaluations]);

  const handleKey = (key) => {
      click();
      addDigit(key);
  };

  const handleDelete = () => {
      click();
      removeDigit();
  }

  const handleEnter = () => {
    if (currentGuess.length !== wordLength) {
      setInvalidGuess(true);
      error();
      window.navigator.vibrate?.(100);
      showToast("Szyfr jest za krótki!");
      setTimeout(() => setInvalidGuess(false), 500);
      return;
    }

    const result = submitGuess();
    if (!result.valid) {
        setInvalidGuess(true);
        error();
        window.navigator.vibrate?.(100);
        showToast(result.message);
        setTimeout(() => setInvalidGuess(false), 500);
        return;
    }

    submit();
    window.navigator.vibrate?.(50);
    
    if (currentGuess === targetCode) {
        win();
        window.navigator.vibrate?.([100, 50, 100]);
        setTimeout(() => setActiveModal('stats'), 1500);
    } else if (guesses.length + 1 >= maxGuesses) {
        error();
        setTimeout(() => setActiveModal('stats'), 1500);
    }
  };

  const handleShare = () => {
      const dateStr = new Date().toLocaleDateString('pl-PL');
      const attempts = status === 'won' ? guesses.length : 'X';
      let shareText = `Codzienny Szyfr ${dateStr} - ${attempts}/${maxGuesses}${isHardMode ? '*' : ''}\n\n`;

      evaluations.forEach(evalRow => {
          shareText += evalRow.map(s => {
              if (s === 'correct') return '🟩';
              if (s === 'present') return '🟨';
              return '⬛';
          }).join('') + '\n';
      });

      navigator.clipboard.writeText(shareText);
      showToast('Skopiowano wynik do schowka!');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header 
          onHelp={() => setActiveModal('help')} 
          onStats={() => setActiveModal('stats')}
          onSettings={() => setActiveModal('settings')}
        />

        <AnimatePresence>
            {toast && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, x: "-50%" }}
                  animate={{ opacity: 1, scale: 1, x: "-50%" }}
                  exit={{ opacity: 0, scale: 0.9, x: "-50%" }}
                  className="fixed top-24 left-1/2 bg-white/10 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl z-[60]"
                >
                    {toast}
                </motion.div>
            )}
        </AnimatePresence>

        <main className="flex-grow flex flex-col items-center justify-center p-4">
          {isTraining && (
              <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
              >
                  <RotateCcw size={12} /> Tryb Treningowy
              </motion.div>
          )}

          <div className="flex flex-col gap-2 mb-8">
            {Array.from({ length: maxGuesses }).map((_, i) => (
              <Row
                key={i}
                length={wordLength}
                guess={i === guesses.length ? currentGuess : guesses[i]}
                evaluation={evaluations[i]}
                isCurrent={i === guesses.length}
                isInvalid={i === guesses.length && invalidGuess}
              />
            ))}
          </div>
        </main>

        <Keyboard 
          onKey={handleKey} 
          onDelete={handleDelete} 
          onEnter={handleEnter}
          usedKeys={usedKeys}
        />
      </div>

      {/* Modale */}
      <Modal 
        isOpen={activeModal === 'help'} 
        onClose={() => setActiveModal(null)} 
        title="Jak Grać?"
      >
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>Zgadnij <span className="text-white font-bold">{wordLength}-cyfrowy</span> szyfr w {maxGuesses} próbach.</p>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex-shrink-0 flex items-center justify-center text-white font-bold">7</div>
              <p>Cyfra 7 jest na <span className="text-emerald-400 font-bold">właściwym miejscu</span>.</p>
            </li>
            <li className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex-shrink-0 flex items-center justify-center text-white font-bold">3</div>
              <p>Cyfra 3 jest w kodzie, ale na <span className="text-amber-400 font-bold">złym miejscu</span>.</p>
            </li>
            <li className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex-shrink-0 flex items-center justify-center text-slate-400 font-bold">9</div>
              <p>Cyfry 9 <span className="text-slate-100 font-bold">nie ma</span> w szyfrze.</p>
            </li>
          </ul>
          <div className="pt-4 border-t border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 italic">
              <Info size={14} /> Kod zmienia się codziennie o północy.
            </div>
            <div className="text-[9px] text-slate-600 uppercase tracking-[0.2em]">
              Autor: <a href="https://github.com/Makaron44" target="_blank" rel="noopener noreferrer" className="text-emerald-500/60 hover:text-emerald-400 transition-colors">Makaron44</a>
            </div>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'stats'} 
        onClose={() => setActiveModal(null)} 
        title="Statystyki"
      >
        <div className="space-y-6">
            <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Gry', value: stats.played },
                  { label: '% Win', value: stats.played ? Math.round((stats.won/stats.played)*100) : 0 },
                  { label: 'Seria', value: stats.currentStreak },
                  { label: 'Max', value: stats.maxStreak },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-xl font-black text-white">{s.value}</div>
                    <div className="text-[8px] uppercase tracking-widest text-slate-500">{s.label}</div>
                  </div>
                ))}
            </div>

            <StatsChart distribution={stats.distribution} maxGuesses={maxGuesses} />

            <div className="py-4 border-y border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 text-center text-indigo-400">Osiągnięcia</h4>
                <div className="flex flex-wrap justify-center gap-2">
                    {allAchievements.map(a => {
                        const isUnlocked = unlockedIds.includes(a.id);
                        return (
                          <div 
                            key={a.id} 
                            className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-500",
                                isUnlocked ? "bg-white/10 shadow-lg shadow-white/5 border border-white/10" : "bg-black/40 grayscale opacity-20"
                            )}
                            title={`${a.title}: ${a.description}`}
                          >
                             {a.icon}
                          </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-center">
                   <div className="text-slate-500 text-[8px] uppercase tracking-widest mb-1 flex items-center gap-1 justify-center"><Timer size={10} /> Kolejny Szyfr</div>
                   <div className="text-xl font-mono font-bold text-white tabular-nums">{timeToNext}</div>
                </div>
                <button 
                    onClick={handleShare}
                    className="flex-grow ml-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                    Podziel się <Share2 size={16} />
                </button>
            </div>

            {status !== 'playing' && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Dzisiejszy szyfr</p>
                    <div className="text-2xl font-black tracking-[0.3em] text-emerald-400">{targetCode}</div>
                </div>
            )}

            {isTraining && (
                <button 
                    onClick={startTraining}
                    className="w-full py-3 border border-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw size={14} /> Gramy dalej!
                </button>
            )}
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'settings'} 
        onClose={() => setActiveModal(null)} 
        title="Ustawienia"
      >
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-white mb-0.5">Długość szyfru</h4>
                    <p className="text-xs text-slate-500">Zmienia poziom trudności</p>
                </div>
                <div className="flex bg-slate-800 rounded-xl p-1">
                    {[3, 4, 5].map(len => (
                        <button
                            key={len}
                            onClick={() => changeDifficulty(len)}
                            className={cn(
                                "w-10 h-10 rounded-lg text-sm font-bold transition-all",
                                wordLength === len ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            )}
                        >
                            {len}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                    <h4 className="font-bold text-white mb-0.5">Tryb Trudny</h4>
                    <p className="text-xs text-slate-500">Wymusza użycie wskazówek</p>
                </div>
                <button 
                    onClick={toggleHardMode}
                    className={cn(
                        "w-12 h-6 rounded-full relative transition-colors duration-300",
                        isHardMode ? "bg-emerald-500" : "bg-slate-700"
                    )}
                >
                    <motion.div 
                        animate={{ x: isHardMode ? 24 : 4 }}
                        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-md"
                    />
                </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                    <h4 className="font-bold text-white mb-0.5">Tryb Treningu</h4>
                    <p className="text-xs text-slate-500">Graj bez ograniczeń czasowych</p>
                </div>
                <button 
                    onClick={isTraining ? stopTraining : startTraining}
                    className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        isTraining ? "bg-amber-500/20 text-amber-400 border border-amber-500/50" : "bg-white/5 text-slate-400 hover:text-white border border-white/5"
                    )}
                >
                   {isTraining ? 'Wyłącz' : 'Uruchom'}
                </button>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-3">
                <h4 className="font-bold text-white mb-0.5">Twoje dane</h4>
                {!isConfirmingReset ? (
                  <button 
                    onClick={() => setIsConfirmingReset(true)}
                    className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Skasuj statystyki
                  </button>
                ) : (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                    <p className="text-[10px] text-red-200 uppercase tracking-widest text-center mb-3">Czy na pewno chcesz usunąć wszystkie dane?</p>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                resetStats();
                                setIsConfirmingReset(false);
                                showToast("Statystyki zostały wyczyszczone");
                            }}
                            className="flex-grow py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                        >
                            Tak, usuń
                        </button>
                        <button 
                            onClick={() => setIsConfirmingReset(false)}
                            className="flex-grow py-3 bg-white/5 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                            Anuluj
                        </button>
                    </div>
                  </div>
                )}
            </div>

            <div className="pt-4 border-t border-white/5 text-[10px] text-slate-600 uppercase tracking-widest text-center leading-relaxed">
                Wersja 2.2.0 &bull; Codzienny Szyfr Pro <br/>
                Projekt i wykonanie: <a href="https://github.com/Makaron44" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">Makaron44</a>
            </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;
