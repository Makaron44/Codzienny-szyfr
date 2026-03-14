import { useState, useEffect } from 'react';

/**
 * Generator kodu bazujący na dacie (Seedowane Random)
 */
export const getDailyCode = (length = 4) => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  let currentSeed = seed;
  const random = () => {
    let x = Math.sin(currentSeed++) * 10000;
    return x - Math.floor(x);
  };
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(random() * 10).toString();
  }
  return code;
};

/**
 * Ocena próby (logika Mastermind/Wordle)
 */
export const evaluateGuess = (guess, target) => {
  const length = target.length;
  const result = Array(length).fill('absent');
  const targetArr = target.split('');
  const guessArr = guess.split('');

  // Zgodne miejsce i cyfra (correct)
  for (let i = 0; i < length; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i] = 'correct';
      targetArr[i] = null;
      guessArr[i] = null;
    }
  }

  // Zła pozycja (present)
  for (let i = 0; i < length; i++) {
    if (guessArr[i] !== null) {
      const idx = targetArr.indexOf(guessArr[i]);
      if (idx > -1) {
        result[i] = 'present';
        targetArr[idx] = null;
      }
    }
  }
  return result;
};

export const useGame = () => {
  const [wordLength, setWordLength] = useState(() => {
    const saved = localStorage.getItem('szyfr-settings');
    return saved ? JSON.parse(saved).wordLength : 4;
  });
  const [isHardMode, setIsHardMode] = useState(() => {
    const saved = localStorage.getItem('szyfr-settings');
    return saved ? JSON.parse(saved).isHardMode : false;
  });
  const [isTraining, setIsTraining] = useState(false);
  const [maxGuesses] = useState(6);
  const [targetCode, setTargetCode] = useState(() => getDailyCode(wordLength));
  
  const [guesses, setGuesses] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [status, setStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [currentGuess, setCurrentGuess] = useState('');

  // Ładowanie stanu z localStorage
  useEffect(() => {
    if (isTraining) return; // Nie zapisujemy stanu treningu na stałe w ten sposób

    const todayStr = new Date().toDateString();
    const savedState = localStorage.getItem('szyfr-state');
    
    if (savedState) {
      const parsed = JSON.parse(savedState);
      if (parsed.lastPlayedDate === todayStr && parsed.wordLength === wordLength) {
        setGuesses(parsed.guesses);
        setEvaluations(parsed.evaluations);
        setStatus(parsed.status);
      } else if (parsed.lastPlayedDate !== todayStr) {
          localStorage.removeItem('szyfr-state');
      }
    }
  }, [wordLength, isTraining]);

  // Zapisywanie stanu
  useEffect(() => {
    if (isTraining) return;

    const state = {
      guesses,
      evaluations,
      status,
      lastPlayedDate: new Date().toDateString(),
      wordLength
    };
    localStorage.setItem('szyfr-state', JSON.stringify(state));
  }, [guesses, evaluations, status, wordLength, isTraining]);

  const addDigit = (digit) => {
    if (status !== 'playing' || currentGuess.length >= wordLength) return;
    setCurrentGuess(prev => prev + digit);
  };

  const removeDigit = () => {
    if (status !== 'playing' || currentGuess.length === 0) return;
    setCurrentGuess(prev => prev.slice(0, -1));
  };

  const validateHardMode = (guess) => {
    if (!isHardMode || guesses.length === 0) return { valid: true };
    
    const lastEvaluation = evaluations[evaluations.length - 1];
    const lastGuess = guesses[guesses.length - 1];

    // Sprawdzenie "correct" (zielone)
    for (let i = 0; i < wordLength; i++) {
        if (lastEvaluation[i] === 'correct' && guess[i] !== lastGuess[i]) {
            return { valid: false, message: `Cyfra na pozycji ${i+1} musi być ${lastGuess[i]}` };
        }
    }

    // Sprawdzenie "present" (żółte) - uproszczone: musi zawierać tę cyfrę
    for (let i = 0; i < wordLength; i++) {
        if (lastEvaluation[i] === 'present' && !guess.includes(lastGuess[i])) {
            return { valid: false, message: `Szyfr musi zawierać cyfrę ${lastGuess[i]}` };
        }
    }

    return { valid: true };
  };

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('szyfr-stats');
    return saved ? JSON.parse(saved) : {
      played: 0,
      won: 0,
      currentStreak: 0,
      maxStreak: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    };
  });

  const [lastGame, setLastGame] = useState(null);

  const updateStats = (won, numGuesses) => {
    if (isTraining) return;

    setStats(prev => {
      const newStats = { ...prev };
      newStats.played++;
      if (won) {
        newStats.won++;
        newStats.currentStreak++;
        if (newStats.currentStreak > newStats.maxStreak) newStats.maxStreak = newStats.currentStreak;
        newStats.distribution[numGuesses] = (newStats.distribution[numGuesses] || 0) + 1;
      } else {
        newStats.currentStreak = 0;
      }
      localStorage.setItem('szyfr-stats', JSON.stringify(newStats));
      return newStats;
    });

    setLastGame({ won, guesses: numGuesses, wordLength, hardMode: isHardMode });
  };

  const submitGuess = () => {
    if (status !== 'playing' || currentGuess.length !== wordLength) return;

    const validation = validateHardMode(currentGuess);
    if (!validation.valid) {
        return validation;
    }

    const evaluation = evaluateGuess(currentGuess, targetCode);
    const newGuesses = [...guesses, currentGuess];
    const newEvaluations = [...evaluations, evaluation];
    
    setGuesses(newGuesses);
    setEvaluations(newEvaluations);

    if (currentGuess === targetCode) {
      setStatus('won');
      updateStats(true, newGuesses.length);
    } else if (newGuesses.length >= maxGuesses) {
      setStatus('lost');
      updateStats(false, newGuesses.length);
    }

    setCurrentGuess('');
    return { valid: true };
  };

  const changeDifficulty = (len) => {
      setWordLength(len);
      setTargetCode(isTraining ? Math.random().toString().slice(2, 2 + len) : getDailyCode(len));
      setGuesses([]);
      setEvaluations([]);
      setStatus('playing');
      setCurrentGuess('');
      
      const settings = JSON.parse(localStorage.getItem('szyfr-settings') || '{}');
      localStorage.setItem('szyfr-settings', JSON.stringify({...settings, wordLength: len}));
  };

  const toggleHardMode = () => {
      const newValue = !isHardMode;
      setIsHardMode(newValue);
      const settings = JSON.parse(localStorage.getItem('szyfr-settings') || '{}');
      localStorage.setItem('szyfr-settings', JSON.stringify({...settings, isHardMode: newValue}));
  };

  const startTraining = () => {
      setIsTraining(true);
      setGuesses([]);
      setEvaluations([]);
      setStatus('playing');
      setCurrentGuess('');
      // Losowy kod (nie dzienny)
      let randomCode = '';
      for(let i=0; i<wordLength; i++) randomCode += Math.floor(Math.random() * 10).toString();
      setTargetCode(randomCode);
  };

  const stopTraining = () => {
      setIsTraining(false);
      setWordLength(wordLength); // Trigger reload daily state
      setTargetCode(getDailyCode(wordLength));
      setGuesses([]);
      setEvaluations([]);
      setStatus('playing');
  };

  const resetStats = () => {
    const freshStats = {
      played: 0,
      won: 0,
      currentStreak: 0,
      maxStreak: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    };
    setStats(freshStats);
    localStorage.setItem('szyfr-stats', JSON.stringify(freshStats));
    localStorage.removeItem('szyfr-achievements');
    setLastGame(null);
  };

  return {
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
  };
};
