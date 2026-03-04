import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGame } from "../GameContext"; 

export const StartScreen = () => {
  const navigate = useNavigate();
  // Safe default in case Context is empty initially
  const { unlockedElements = [], resetGame } = useGame();

  const handleStart = () => {
    // This tells the Router to switch to the <GameScreen />
    navigate("/game");
  };

  return (
    <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center relative overflow-hidden font-sans text-white">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px]" />
        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full bg-blue-500/10 blur-md" style={{ width: Math.random()*50+20, height: Math.random()*50+20, left: `${Math.random()*100}%`, top: `${Math.random()*100}%` }} animate={{ y: [0, -50, 0], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 5 + Math.random()*5, repeat: Infinity }} />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-2xl px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 1.5 }} className="w-24 h-24 mx-auto mb-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.5)] flex items-center justify-center text-5xl select-none">⚛️</motion.div>

        <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">ATOM<span className="text-blue-500">CRAFT</span></h1>
        
        <p className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed max-w-lg mx-auto">
          The periodic table has been scrambled. <br/>
          Analyze subatomic clues. Synthesize elements. <br/>
          Rebuild the universe.
        </p>

        <div className="flex flex-col gap-4 items-center">
          
          {/* THE BUTTON */}
          <button 
            onClick={handleStart}
            className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-[0.2em] uppercase rounded-full transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] w-64 active:scale-95"
          >
            <span className="relative z-10">
              {unlockedElements && unlockedElements.length > 0 ? "Resume Research" : "Initialize Lab"}
            </span>
          </button>

          {unlockedElements && unlockedElements.length > 0 && (
            <button 
              onClick={() => { if(window.confirm("Are you sure? This will wipe your save.")) resetGame(); }}
              className="text-xs text-slate-500 uppercase tracking-widest hover:text-red-400 transition-colors mt-4"
            >
              Reset System Data
            </button>
          )}
          
        </div>

        <div className="mt-16 flex justify-center gap-8 text-[10px] uppercase font-bold text-slate-600 tracking-widest">
          <div>Build v2.1</div>
          <div>Database: {unlockedElements ? unlockedElements.length : 0} / 118</div>
        </div>

      </div>
    </div>
  );
};