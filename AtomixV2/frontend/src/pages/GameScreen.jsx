import { useState, useEffect } from "react";
import { useGame } from "../GameContext"; 
import { generateRoundDeck } from "../utils/quizGenerator";
import { BohrModel } from "../components/BohrModel";
import { ElementGrid } from "../components/ElementGrid";
import { AnimatePresence, motion } from "framer-motion";
import { ElementInfoModal } from "../components/ElementInfoModal";

export const GameScreen = () => {
  const { 
    unlockedElements = [], 
    targetElement, 
    questionsAsked = 0, 
    correctCount = 0, 
    submitAnswer, 
    resetGame 
  } = useGame();
  
  const [questionDeck, setQuestionDeck] = useState([]);
  const [feedback, setFeedback] = useState(null); 
  const [selectedElement, setSelectedElement] = useState(null); 
  
  // 1. NEW STATE: Track what the user clicked so we can style it
  const [userSelection, setUserSelection] = useState(null);

  const [showResetModal, setShowResetModal] = useState(false);
  const [roundStatus, setRoundStatus] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);

  const TEST_UNLOCK_ALL = false; 

  // --- LOGIC: GENERATE DECK ON TARGET CHANGE ---
  useEffect(() => {
    if (targetElement) {
      const newDeck = generateRoundDeck(targetElement);
      setQuestionDeck(newDeck);
      setFeedback(null);
      setUserSelection(null); // Reset selection
      setRoundStatus(null);
    }
  }, [targetElement]);

  const currentQuestion = questionDeck[questionsAsked] || null;
  const progressPercent = Math.round((questionsAsked / 5) * 100);

  // Logic: Show progress for Target, 100% for others
  const isViewingTarget = !selectedElement || (selectedElement.number === targetElement);
  const displayCharge = isViewingTarget ? (questionsAsked / 5) : 1.0;
  const reactorLabel = isViewingTarget ? "REACTOR CHARGE" : "INSPECTION MODE";
  const progressText = isViewingTarget ? `${progressPercent}%` : "100%";
  
  const elementToDisplay = selectedElement ? selectedElement.number : targetElement;
  const isSelectedUnlocked = selectedElement && unlockedElements.includes(selectedElement.number);

  const handleAnswer = (selectedOption) => {
    if (feedback || roundStatus || !currentQuestion) return; 

    // 2. SAVE SELECTION
    setUserSelection(selectedOption);

    const isCorrect = selectedOption === currentQuestion.answer;
    setFeedback(isCorrect ? "correct" : "wrong");
    
    // Wait longer (1.5s) so user can see the correction
    setTimeout(() => {
      const result = submitAnswer(isCorrect); 
      
      // Reset local UI state for the next question
      setFeedback(null);
      setUserSelection(null);

      if (result === 'unlocked') setRoundStatus("success");
      else if (result === 'failed') setRoundStatus("failed");
    }, 1500); 
  };

  const visibleUnlockedIds = TEST_UNLOCK_ALL 
    ? Array.from({ length: 118 }, (_, i) => i + 1) 
    : unlockedElements;

  if (!submitAnswer) return <div className="h-screen bg-[#0f172a] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="h-screen w-screen bg-[#0f172a] text-white overflow-hidden relative flex flex-col font-sans selection:bg-blue-500/30">
      
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 shrink-0 h-16 border-b border-white/10 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-4">
           <div className="w-2 h-8 bg-blue-500 rounded-sm shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
           <div>
              <div className="text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase">Status</div>
              <div className="text-xl font-black text-white tracking-tight">LAB INTERFACE <span className="text-white/20">V2.0</span></div>
           </div>
        </div>

        <div className="flex-1 max-w-md mx-8">
            <input type="text" placeholder="SEARCH ELEMENT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono tracking-wider" />
        </div>

        <div className="flex items-center gap-8 md:gap-12">
           <button onClick={() => setShowResetModal(true)} className="hidden md:block px-4 py-1.5 border border-red-500/30 text-red-400/70 text-[10px] font-bold tracking-[0.2em] uppercase rounded hover:bg-red-500 transition-all">System Purge</button>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">Discovered</div>
              <div className="text-2xl font-mono font-medium text-white">
                <span className="text-blue-400">{unlockedElements.length}</span> <span className="text-slate-600">/</span> 118
              </div>
           </div>
           <div className="text-right">
              <div className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">Target</div>
              <div className="text-2xl font-mono font-medium text-emerald-400">#{targetElement || "?"}</div>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-4 md:p-6 grid grid-rows-[1fr_auto] lg:grid-rows-none lg:grid-cols-12 gap-4 md:gap-6 overflow-hidden">
        
        {/* Left: Periodic Table */}
        <section className="lg:col-span-8 bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden relative flex flex-col backdrop-blur-sm">
           <div className="absolute top-4 left-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest z-20 pointer-events-none">
             Live Element Database {TEST_UNLOCK_ALL && <span className="text-yellow-500 ml-2 animate-pulse">(DEBUG MODE ACTIVE)</span>}
           </div>
           <div className="flex-1 overflow-auto custom-scrollbar p-4 md:p-8 flex items-center justify-center">
              <ElementGrid unlockedIds={visibleUnlockedIds} targetId={targetElement} onElementClick={setSelectedElement} searchTerm={searchTerm} />
           </div>
        </section>

        {/* Right Sidebar */}
        <section className="lg:col-span-4 flex flex-col gap-4 md:gap-6 min-h-0">
           
           {/* Question Console */}
           <div className="flex-none bg-slate-800/80 border-t-4 border-blue-500 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] z-0 pointer-events-none opacity-20"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                 <div>
                    <h2 className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${roundStatus ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`}></span> 
                        {roundStatus 
                          ? "ANALYSIS REPORT" 
                          : `PHASE ${Math.min(questionsAsked + 1, 5)} / 5 • SCORE: ${correctCount}/3`
                        }
                    </h2>
                    <p className="text-lg md:text-xl font-medium text-white mb-6 leading-snug drop-shadow-md">
                        {roundStatus === 'success' ? "Analysis Complete. Element Unlocked." : 
                         roundStatus === 'failed' ? "Analysis Failed. Rerouting..." :
                         (!currentQuestion ? "Finalizing Data..." : currentQuestion.q)}
                    </p>
                 </div>

                 {/* --- 3. UPDATED BUTTON MAPPING --- */}
                 {!roundStatus && currentQuestion && (
                     <div className="grid grid-cols-2 gap-3">
                        {currentQuestion.options.map((option, idx) => {
                           // Define States
                           const isSelected = userSelection === option;
                           const isCorrectAnswer = option === currentQuestion.answer;
                           const showResult = feedback !== null;

                           // Determine Class
                           let btnClass = "bg-slate-700/50 border-white/10 text-slate-300 hover:bg-blue-600 hover:border-blue-500 hover:text-white";
                           
                           if (showResult) {
                              if (isCorrectAnswer) {
                                  // ALWAYS GREEN (Show the right answer)
                                  btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] font-bold";
                              } else if (isSelected && !isCorrectAnswer) {
                                  // RED (Show the user's mistake)
                                  btnClass = "bg-red-500/20 border-red-500 text-red-300 opacity-80";
                              } else {
                                  // Dim the others
                                  btnClass = "bg-slate-800/50 border-white/5 text-slate-600 opacity-40";
                              }
                           }

                           return (
                             <button 
                               key={idx} 
                               onClick={() => handleAnswer(option)} 
                               disabled={showResult} // Disable clicking during feedback
                               className={`relative py-3 px-4 rounded-lg text-sm font-bold tracking-wide border transition-all duration-300 group overflow-hidden ${btnClass}`}
                             >
                                <span className="relative z-10">{option}</span>
                             </button>
                           );
                        })}
                     </div>
                 )}
              </div>
           </div>

           {/* REACTOR */}
           <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-3xl relative overflow-hidden flex items-center justify-center min-h-[250px] shadow-inner group">
              <div className="absolute inset-0 border-[20px] border-slate-900/80 rounded-full opacity-20 pointer-events-none scale-150"></div>
              
              <div className="absolute top-4 right-4 text-right z-10">
                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{reactorLabel}</div>
                 <div className="text-2xl font-mono font-medium text-emerald-400 shadow-emerald-400/20 drop-shadow-lg">{progressText}</div>
              </div>
              
              {selectedElement && (
                <div className="absolute bottom-4 left-4 z-40 flex flex-col gap-2 items-start">
                   <button onClick={() => setSelectedElement(null)} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 backdrop-blur-md shadow-lg transition-all flex items-center gap-2"><span>←</span> Return</button>
                   {isSelectedUnlocked && (
                     <button onClick={() => setShowInfoModal(true)} className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600 hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/50 backdrop-blur-md shadow-lg transition-all text-blue-300 flex items-center gap-2">
                       <span>ℹ</span> View Full Data
                     </button>
                   )}
                </div>
              )}
              
              <AnimatePresence>
                {roundStatus && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm ${roundStatus === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                        <div className="text-3xl font-black uppercase tracking-widest shadow-lg">{roundStatus === 'success' ? "UNLOCKED" : "FAILED"}</div>
                    </motion.div>
                )}
              </AnimatePresence>

              <div className="w-full h-full transform scale-90">
                 {elementToDisplay && <BohrModel atomicNumber={elementToDisplay} currentCharge={displayCharge} />}
              </div>
           </div>
        </section>
      </main>

      <AnimatePresence>{showInfoModal && selectedElement && <ElementInfoModal element={selectedElement} onClose={() => setShowInfoModal(false)} />}</AnimatePresence>
      <AnimatePresence>{showResetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowResetModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-slate-900 border border-red-500/30 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden">
              <div className="relative z-10 p-8 text-center">
                <h3 className="text-xl font-black text-white uppercase mb-2">System Purge Detected</h3>
                <p className="text-slate-400 text-sm mb-8">Permanently delete all progress?</p>
                <div className="grid grid-cols-2 gap-4"><button onClick={() => setShowResetModal(false)} className="py-3 bg-white/5 rounded">CANCEL</button><button onClick={() => { resetGame(); setShowResetModal(false); }} className="py-3 bg-red-600 rounded">CONFIRM</button></div>
              </div>
            </motion.div>
          </div>
      )}</AnimatePresence>
    </div>
  );
};