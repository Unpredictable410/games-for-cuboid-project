import { createContext, useContext, useState, useEffect } from "react";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  // --- STATE WITH LOCAL STORAGE ---
  
  // 1. Initialize from Storage (or empty if new)
  const [unlockedElements, setUnlockedElements] = useState(() => {
    const saved = localStorage.getItem("unlockedElements");
    return saved ? JSON.parse(saved) : [];
  });
  
  // 2. Initialize Target from Storage (or random if new)
  const [targetElement, setTargetElement] = useState(() => {
    const saved = localStorage.getItem("targetElement");
    // If we have a saved target, keep it. Otherwise pick random 1-118.
    return saved ? parseInt(saved) : Math.floor(Math.random() * 118) + 1;
  }); 
  
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [correctCount, setCorrectCount] = useState(0); 
  
  // --- SAVE TO LOCAL STORAGE ---
  // Whenever unlocks or target changes, save it immediately.
  useEffect(() => {
    localStorage.setItem("unlockedElements", JSON.stringify(unlockedElements));
    localStorage.setItem("targetElement", targetElement.toString());
  }, [unlockedElements, targetElement]);

  // --- ACTIONS ---

  const pickNewTarget = (currentUnlocked) => {
    const allIds = Array.from({ length: 118 }, (_, i) => i + 1);
    const lockedIds = allIds.filter(id => !currentUnlocked.includes(id));

    if (lockedIds.length > 0) {
        return lockedIds[Math.floor(Math.random() * lockedIds.length)];
    } else {
        return null;
    }
  };

  const submitAnswer = (isCorrect) => {
    let newScore = correctCount;
    if (isCorrect) {
      newScore = correctCount + 1;
      setCorrectCount(newScore);
    }

    const newCount = questionsAsked + 1;
    setQuestionsAsked(newCount);

    // --- CHECK END OF ROUND (At Question 5) ---
    if (newCount >= 5) {
      if (newScore >= 3) {
        // SUCCESS
        const justUnlocked = targetElement;
        
        let newUnlockedList = unlockedElements;
        if (!unlockedElements.includes(justUnlocked)) {
           newUnlockedList = [...unlockedElements, justUnlocked];
           setUnlockedElements(newUnlockedList);
        }
        
        setTimeout(() => {
            const next = pickNewTarget(newUnlockedList);
            if (next) setTargetElement(next);
            resetRound();
        }, 2000); 

        return 'unlocked';
      } else {
        // FAILED - Pick new target anyway (as requested)
        setTimeout(() => {
            const next = pickNewTarget(unlockedElements);
            if (next) setTargetElement(next);
            resetRound(); 
        }, 2000);
        return 'failed';
      }
    }

    return isCorrect ? 'correct' : 'wrong';
  };

  const resetRound = () => {
    setQuestionsAsked(0);
    setCorrectCount(0);
  };

  const resetGame = () => {
    // Clear storage and state
    localStorage.removeItem("unlockedElements");
    localStorage.removeItem("targetElement");
    
    setUnlockedElements([]); 
    setTargetElement(Math.floor(Math.random() * 118) + 1);
    resetRound();
  };

  return (
    <GameContext.Provider value={{ 
      unlockedElements, 
      targetElement, 
      questionsAsked,
      correctCount, 
      submitAnswer, 
      resetGame 
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);