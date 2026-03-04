import { useState } from "react";
import { periodicTableData } from "../data/periodicTable";
import { motion, AnimatePresence } from "framer-motion";

// 1. ACCEPT 'targetId' PROP
export const ElementGrid = ({ unlockedIds = [], targetId = null, onElementClick, searchTerm = "" }) => {
  const [hoveredElement, setHoveredElement] = useState(null);
  const term = searchTerm.toLowerCase().trim();

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <motion.div 
        className="grid gap-[2px] md:gap-1 w-full max-w-[1600px] select-none"
        style={{ 
          gridTemplateColumns: "repeat(18, 1fr)", 
          gridTemplateRows: "repeat(10, 1fr)",
        }}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {periodicTableData.map((el, idx) => {
          const num = el.number;
          const isUnlocked = unlockedIds.includes(num);
          
          // 2. CHECK IF THIS IS THE TARGET
          const isTarget = num === targetId;

          const isHovered = hoveredElement === num;
          const col = el.xpos; 
          const row = el.ypos; 

          const isMatch = term && isUnlocked && (
             el.name.toLowerCase().includes(term) || 
             el.symbol.toLowerCase() === term || 
             String(num) === term
          );

          // --- COLOR & STYLE LOGIC ---
          const categoryColor = getCategoryColor(el.category);
          let finalClass;
          let showContent = false;

          if (term) {
             // Search Mode (Unchanged)
             if (isMatch) {
                 finalClass = `${categoryColor} z-50 scale-125 shadow-[0_0_25px_rgba(255,255,255,0.5)] ring-1 ring-white`;
                 showContent = true; 
             } else {
                 finalClass = "bg-slate-900/40 border-white/5 opacity-5 grayscale blur-[1px]";
                 showContent = false;
             }
          } else {
             // Normal Mode
             if (isUnlocked) {
                 finalClass = `${categoryColor} shadow-md`;
                 showContent = true;
             } 
             else if (isTarget) {
                 // 3. TARGET STYLE: GLOWING PULSE
                 // Uses a special amber/yellow border and shadow to signify "Work in Progress"
                 finalClass = "bg-slate-800/80 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse z-20";
                 showContent = false; // Keep it mysterious (or set true if you want to reveal the symbol early)
             }
             else {
                 finalClass = "bg-slate-900/40 border-white/5 opacity-20 grayscale";
                 showContent = false;
             }
          }

          // Allow clicking target to inspect it (optional)
          const isInteractive = isUnlocked || isMatch || isTarget;

          return (
            <motion.div
              key={`${num}-${idx}`}
              variants={itemVariants}
              style={{ gridColumn: col, gridRow: row }}
              
              onMouseEnter={() => isInteractive && setHoveredElement(num)}
              onMouseLeave={() => setHoveredElement(null)}
              onClick={() => isInteractive && onElementClick(el)}

              animate={{ 
                scale: isHovered ? 1.4 : (isMatch ? 1.25 : 1), 
                zIndex: isHovered ? 60 : (isMatch ? 50 : (isTarget ? 20 : 1)),
                filter: isHovered ? "brightness(1.2)" : (term && !isMatch ? "brightness(0.5) blur(1px)" : "brightness(1)")
              }}
              transition={{ duration: 0.2 }}

              className={`
                aspect-square flex flex-col items-center justify-center rounded-[2px] md:rounded-md border 
                relative cursor-pointer transition-colors duration-200
                ${finalClass}
              `}
            >
              {/* Show Target Number so they know WHERE it is */}
              {(showContent || isTarget) ? (
                <>
                  <span className={`absolute top-[2%] left-[5%] text-[0.5vw] md:text-[9px] font-mono leading-none ${isTarget ? "text-amber-400 font-bold" : "text-white/60"}`}>
                    {num}
                  </span>
                  
                  {isTarget ? (
                    // Target Icon (Lock or Question Mark)
                    <span className="text-amber-500/50 text-[1.5vw]">?</span>
                  ) : (
                    <span className={`font-black text-white drop-shadow-md leading-none ${el.symbol.length > 2 ? 'text-[1vw] md:text-xs' : 'text-[1.8vw] md:text-base lg:text-xl'}`}>
                      {el.symbol}
                    </span>
                  )}

                  <AnimatePresence>
                    {isHovered && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
                      >
                        <div className="bg-slate-900/95 border border-white/20 text-white text-[10px] font-bold px-2 py-1 rounded shadow-[0_4px_20px_rgba(0,0,0,0.8)] whitespace-nowrap backdrop-blur-md">
                          {isTarget ? "TARGET LOCKED" : el.name}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <span className="text-white/10 text-[0.6vw] font-mono font-bold">{num}</span>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

// ... (Variants and Category Colors remain the same)
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.001 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  show: { opacity: 1, scale: 1 }
};

const getCategoryColor = (category) => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("alkali") && !cat.includes("earth")) return "bg-red-600/80 border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.4)]";
  if (cat.includes("alkaline") || cat.includes("earth")) return "bg-orange-600/80 border-orange-500 shadow-[0_0_10px_rgba(234,88,12,0.4)]";
  if (cat.includes("transition")) return "bg-rose-600/80 border-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.4)]";
  if (cat.includes("post-transition") || cat.includes("poor")) return "bg-indigo-600/80 border-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.4)]";
  if (cat.includes("metalloid")) return "bg-teal-600/80 border-teal-500 shadow-[0_0_10px_rgba(13,148,136,0.4)]";
  if (cat.includes("nonmetal")) return "bg-blue-600/80 border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.4)]";
  if (cat.includes("noble")) return "bg-purple-600/80 border-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.4)]";
  if (cat.includes("lanthanide")) return "bg-fuchsia-700/80 border-fuchsia-500 shadow-[0_0_10px_rgba(192,38,211,0.4)]";
  if (cat.includes("actinide")) return "bg-pink-700/80 border-pink-500 shadow-[0_0_10px_rgba(190,24,93,0.4)]";
  return "bg-slate-700 border-slate-500";
};