import { useMemo } from "react";
import { motion } from "framer-motion";

export const BohrModel = ({ atomicNumber, currentCharge = 1 }) => {
  // 1. Calculate Electron Configuration
  const shells = useMemo(() => {
    const electrons = [];
    let remaining = atomicNumber;
    const capacities = [2, 8, 18, 32, 32, 18, 8]; 

    for (let i = 0; i < capacities.length; i++) {
      if (remaining <= 0) break;
      const count = Math.min(remaining, capacities[i]);
      electrons.push(count);
      remaining -= count;
    }
    return electrons;
  }, [atomicNumber]);

  // 2. Auto-Scaling
  const numShells = shells.length;
  const baseScale = numShells > 5 ? 0.55 : numShells > 3 ? 0.75 : 1; 
  const spinDuration = Math.max(3, 12 - (currentCharge * 8));

  // --- 3. NUCLEUS GENERATOR ---
  const renderNucleus = () => {
    // MODE A: Small Atom (Draw individual protons)
    if (atomicNumber <= 10) {
      const protons = Array.from({ length: atomicNumber }).map((_, i) => {
        const angle = i * 2.4; 
        const radius = Math.sqrt(i) * 3; 
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        return (
          <div 
            key={i}
            className="absolute w-2.5 h-2.5 rounded-full bg-red-500 border border-red-800 shadow-sm"
            style={{ 
              left: `calc(50% + ${x}px - 1.25px)`, 
              top: `calc(50% + ${y}px - 1.25px)` 
            }}
          />
        );
      });
      return <div className="relative w-8 h-8 flex items-center justify-center">{protons}</div>;
    }

    // MODE B: Large Atom (Solid Core with Text)
    return (
      <div className="relative w-8 h-8 rounded-full bg-red-600 border-2 border-red-400 shadow-inner flex items-center justify-center z-20">
        <span className="text-[9px] font-black text-white leading-none">{atomicNumber}p</span>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      
      {/* --- NEW: ELECTRON COUNT DISPLAY (Top Left) --- */}
      <div className="absolute top-4 left-4 z-30 pointer-events-none">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">Electron Count</div>
        <div className="text-2xl font-mono font-medium text-cyan-400 shadow-cyan-400/20 drop-shadow-lg flex items-center gap-2">
           {atomicNumber} <span className="text-sm text-cyan-500/50">e⁻</span>
        </div>
      </div>

      <motion.div 
        className="relative flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: baseScale }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* NUCLEUS RENDERER */}
        <div className="absolute z-20 flex items-center justify-center">
           {renderNucleus()}
        </div>

        {/* ORBITAL RINGS */}
        {shells.map((count, i) => {
          const size = (i + 1) * 60 + 30; 
          
          return (
            <motion.div
              key={`shell-${i}`}
              className="absolute rounded-full border border-cyan-500/50 flex items-center justify-center"
              style={{ width: size, height: size }}
              animate={{ rotate: 360 }}
              transition={{ 
                repeat: Infinity, 
                ease: "linear", 
                duration: spinDuration + (i * 4) 
              }}
            >
              {/* ELECTRONS */}
              {[...Array(count)].map((_, eIdx) => {
                const angle = (eIdx / count) * 2 * Math.PI;
                const x = (size / 2) * Math.cos(angle);
                const y = (size / 2) * Math.sin(angle);

                return (
                  <div
                    key={`e-${i}-${eIdx}`}
                    className="absolute w-3 h-3 bg-cyan-400 rounded-full border border-black/20"
                    style={{
                      left: `calc(50% + ${x}px - 6px)`, 
                      top: `calc(50% + ${y}px - 6px)`,
                    }}
                  />
                );
              })}
            </motion.div>
          );
        })}
      </motion.div>

      {/* --- LEGEND --- */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-slate-900/80 p-3 rounded-lg border border-white/10 backdrop-blur-sm z-30 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 border border-red-800"></div>
          <span className="text-[10px] text-slate-300 font-bold tracking-widest uppercase">Proton (+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400 border border-black/20"></div>
          <span className="text-[10px] text-slate-300 font-bold tracking-widest uppercase">Electron (-)</span>
        </div>
      </div>

    </div>
  );
};