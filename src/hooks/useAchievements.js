import { useState, useEffect } from 'react';

const ACHIEVEMENTS = [
  { id: 'first_win', title: 'Pierwsza krew', description: 'Odgadnij swój pierwszy szyfr', icon: '🎯' },
  { id: 'sniper', title: 'Snajper', description: 'Odgadnij szyfr w 2 próbach lub mniej', icon: '🏹' },
  { id: 'streak_3', title: 'Solidna seria', description: 'Utrzymaj serię 3 dni z rzędu', icon: '🔥' },
  { id: 'master_5', title: 'Mistrz Piątek', description: 'Odgadnij 5-cyfrowy szyfr', icon: '💎' },
  { id: 'hard_core', title: 'Hard Kor', description: 'Wygraj w trybie trudnym', icon: '💀' }
];

export const useAchievements = (stats, lastGame) => {
  const [unlocked, setUnlocked] = useState(() => {
    const saved = localStorage.getItem('szyfr-achievements');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const newUnlocked = [...unlocked];
    let changed = false;

    const checkAndUnlock = (id) => {
      if (!newUnlocked.includes(id)) {
        newUnlocked.push(id);
        changed = true;
      }
    };

    if (stats.won > 0) checkAndUnlock('first_win');
    if (lastGame?.won && lastGame.guesses <= 2) checkAndUnlock('sniper');
    if (stats.currentStreak >= 3) checkAndUnlock('streak_3');
    if (lastGame?.won && lastGame.wordLength === 5) checkAndUnlock('master_5');
    if (lastGame?.won && lastGame.hardMode) checkAndUnlock('hard_core');

    if (changed) {
      setUnlocked(newUnlocked);
      localStorage.setItem('szyfr-achievements', JSON.stringify(newUnlocked));
    }
  }, [stats, lastGame]);

  return {
    allAchievements: ACHIEVEMENTS,
    unlockedIds: unlocked
  };
};
