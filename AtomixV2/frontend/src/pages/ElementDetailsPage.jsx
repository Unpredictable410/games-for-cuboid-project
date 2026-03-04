import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { funAssociations } from "../data/funAssociations";
import { getAbundanceData } from "../data/abundanceData"; 

// --- SOURCES ---
const PUBCHEM_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name";
const PUBCHEM_VIEW_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound";
const ELEMENT_DATA_URL = "https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json";
const WIKI_API_URL = "https://en.wikipedia.org/api/rest_v1/page/summary";

export const ElementDetailsPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();

  const [elementData, setElementData] = useState(null); 
  const [pubChemUses, setPubChemUses] = useState(null);
  const [wikiExtract, setWikiExtract] = useState(null); 
  const [loading, setLoading] = useState(true);

  // Dynamic Images
  const realImage = `https://images-of-elements.com/${name.toLowerCase()}.jpg`;
  
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // 1. JSON Data
        const jsonRes = await fetch(ELEMENT_DATA_URL);
        const jsonData = await jsonRes.json();
        const found = jsonData.elements.find(e => e.name.toLowerCase() === name.toLowerCase());
        setElementData(found);

        // 2. PubChem Uses
        const usesRes = await fetch(`${PUBCHEM_VIEW_BASE}/${name}/JSON?heading=Uses`);
        if (usesRes.ok) {
           const usesJson = await usesRes.json();
           setPubChemUses(extractPubChemUses(usesJson));
        }

        // 3. Wikipedia Summary
        const wikiRes = await fetch(`${WIKI_API_URL}/${name}`);
        if (wikiRes.ok) {
          const wikiJson = await wikiRes.json();
          setWikiExtract(wikiJson.extract);
        }

      } catch (error) {
        console.error("Fetch failed:", error);
      }
      setLoading(false);
    };

    fetchAllData();
  }, [name]);

  // --- DERIVED DATA ---
  const funFact = elementData ? funAssociations.find(f => f.symbol === elementData.symbol) : null;
  const abundance = elementData ? getAbundanceData(elementData.number) : null;
  const discovery = elementData ? getDiscoveryInfo(elementData.number, elementData.discovered_by, elementData.year) : null;

  if (loading) return <div className="h-screen flex items-center justify-center text-blue-400 font-mono animate-pulse">ACCESSING ARCHIVES...</div>;

  return (
    <div className="min-h-screen text-white p-4 md:p-8 font-sans overflow-x-hidden relative bg-[#0f172a]">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Nav */}
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-2 text-xs font-bold tracking-widest transition-all group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span> RETURN TO LAB
      </button>

      {/* --- HEADER SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 border-b border-white/10 pb-12">
        
        {/* LEFT COLUMN: Visuals & Metrics */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           {/* Image */}
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
             className="relative aspect-square rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl group"
           >
              <img src={realImage} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                 <span className="text-4xl font-black text-white">{elementData?.number}</span>
              </div>
           </motion.div>
           
           {/* Identity Card */}
           <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
              <h1 className="text-5xl font-black text-white mb-2 tracking-tight">{elementData?.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                 <span className="text-2xl font-mono text-blue-400">{elementData?.symbol}</span>
                 <span className="h-1 w-1 bg-slate-500 rounded-full"></span>
                 <span className="text-sm text-slate-400 uppercase tracking-widest">{elementData?.category}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-blue-500 pl-4">
                 "{elementData?.summary}"
              </p>
           </div>

           {/* Material Analysis (Density/Phase) */}
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
             className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-white/10"
           >
             <div className="flex items-center gap-2 mb-6">
               <div className="w-1 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_springgreen]" />
               <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em]">Material Analysis</h3>
             </div>

             <div className="space-y-4">
               <div className="flex justify-between items-center py-2 border-b border-white/5">
                 <span className="text-[10px] text-slate-500 uppercase font-bold">State at 20°C</span>
                 <span className="flex items-center gap-2 text-white font-bold uppercase text-sm">
                    <span>{getPhaseIcon(elementData?.phase)}</span>
                    {elementData?.phase || "Unknown"}
                 </span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-white/5">
                 <span className="text-[10px] text-slate-500 uppercase font-bold">Density</span>
                 <span className="text-white font-mono text-sm">{elementData?.density ? `${elementData.density} g/cm³` : "N/A"}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-white/5">
                 <span className="text-[10px] text-slate-500 uppercase font-bold">Melting Point</span>
                 <span className="text-blue-300 font-mono text-sm">{elementData?.melt ? `${elementData.melt} K` : "N/A"}</span>
               </div>
             </div>
           </motion.div>

           {/* Electron Grip Strength */}
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
             className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 relative overflow-hidden"
           >
             <div className="absolute -right-4 -top-4 text-[100px] font-black text-white/5 select-none leading-none z-0">eV</div>
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-2">
                 <div className="w-1 h-4 bg-rose-500 rounded-full shadow-[0_0_10px_red]" />
                 <h3 className="text-xs font-bold text-rose-400 uppercase tracking-[0.2em]">Electron Grip Strength</h3>
               </div>
               
               {elementData?.ionization_energies && elementData.ionization_energies.length > 0 ? (
                 <div className="space-y-4 mt-4">
                   {elementData.ionization_energies.slice(0, 3).map((energy, index) => (
                     <div key={index} className="relative">
                       <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase mb-1">
                         <span>{index === 0 ? "Stealing 1st" : index === 1 ? "Stealing 2nd" : "Stealing 3rd"}</span>
                         <span className="text-white">{energy} kJ</span>
                       </div>
                       <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                         <motion.div 
                           initial={{ width: 0 }} 
                           whileInView={{ width: `${Math.min(100, (energy / 5000) * 100)}%` }} 
                           transition={{ duration: 1, delay: 0.1 * index }}
                           className={`h-full shadow-[0_0_10px_currentColor] ${energy < 700 ? "bg-emerald-500 text-emerald-500" : energy < 2000 ? "bg-yellow-500 text-yellow-500" : "bg-rose-500 text-rose-500"}`}
                         />
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-4 text-slate-500 text-xs font-mono border-2 border-dashed border-white/5 rounded-xl mt-4">GRIP DATA UNAVAILABLE</div>
               )}
             </div>
           </motion.div>
        </div>

        {/* RIGHT COLUMN: The "Profile" */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           
           {/* --- ELEMENT PROFILE --- */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
             className="flex-1 bg-slate-900/50 p-8 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col"
           >
              <div className="absolute top-0 right-0 p-6 opacity-5 text-9xl select-none pointer-events-none">📖</div>
              <h3 className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> Element Profile
              </h3>
              
              <div className="prose prose-invert max-w-none flex-1">
                 
                 {/* 1. General Info (Wikipedia) */}
                 <div className="mb-6">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Overview</h4>
                   <p className="text-lg text-slate-200 leading-relaxed">
                      {wikiExtract || elementData?.summary || "Archives unavailable."}
                   </p>
                 </div>
                 
                 <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />
                 
                 {/* 2. Origins (Discovery) - ACCURATE YEAR */}
                 <div className="mb-6">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Origins</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Discovered by <strong className="text-slate-200">{discovery.by}</strong> in <strong className="text-slate-200">{discovery.year}</strong>.
                    </p>
                 </div>

                 {/* 3. The "Fun Fact" Box (Keep this as is) */}
                 {funFact && (
                   <div className="mb-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-xl border border-white/5">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <span className="text-base">🌍</span> Primary Application
                      </h4>
                      <div className="text-lg font-bold text-white mb-1">{funFact.thing}</div>
                      <div className="text-sm text-slate-400 italic">"{funFact.clue}"</div>
                   </div>
                 )}

                 {/* --- NEW: COSMIC & NUCLEAR PROFILE --- */}
                 {/* This replaces the old property grid with new, non-JSON data */}
                 <div className="grid grid-cols-3 gap-3 mb-6">
                    
                    {/* Card 1: Cosmic Origin (Where it was born) */}
                    <div className="bg-slate-800/40 p-3 rounded-xl border border-white/5 flex flex-col items-center text-center hover:bg-slate-800/60 transition-colors">
                       <div className="text-lg mb-1 opacity-80">
                          {getOriginData(elementData?.number).icon}
                       </div>
                       <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Origin</div>
                       <div className="text-xs font-mono text-white font-medium whitespace-nowrap">
                          {getOriginData(elementData?.number).text}
                       </div>
                    </div>

                    {/* Card 2: Nuclear Stability (Radioactive or Stable) */}
                    <div className="bg-slate-800/40 p-3 rounded-xl border border-white/5 flex flex-col items-center text-center hover:bg-slate-800/60 transition-colors">
                       <div className="text-lg mb-1 opacity-80">
                          {getRadioactivity(elementData?.number).icon}
                       </div>
                       <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Nuclear</div>
                       <div className={`text-xs font-mono font-medium whitespace-nowrap ${getRadioactivity(elementData?.number).color}`}>
                          {getRadioactivity(elementData?.number).text}
                       </div>
                    </div>

                    {/* Card 3: Quantum Block (s, p, d, f orbitals) */}
                    <div className="bg-slate-800/40 p-3 rounded-xl border border-white/5 flex flex-col items-center text-center hover:bg-slate-800/60 transition-colors">
                       <div className="text-lg mb-1 opacity-80">🏗️</div>
                       <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Block</div>
                       <div className="text-xs font-mono text-blue-300 font-medium whitespace-nowrap">
                          {getQuantumBlock(elementData?.group, elementData?.number)}-Orbital
                       </div>
                    </div>

                 </div>
              </div>
           </motion.div>

           {/* --- Rarity & Availability --- */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
             className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-8 border border-white/10 relative overflow-hidden"
           >
             <div className="absolute top-0 right-0 p-6 opacity-5 text-8xl select-none">📊</div>
             <h3 className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
               Rarity & Availability
             </h3>

             {abundance && (
               <div className="space-y-6">
                 {[
                   { label: "Is it in Space?", color: "bg-purple-500", track: "from-purple-900/20", icon: "🌌", val: abundance.univ },
                   { label: "Is it on Earth?", color: "bg-emerald-500", track: "from-emerald-900/20", icon: "🌍", val: abundance.earth },
                   { label: "Is it in You?", color: "bg-rose-500", track: "from-rose-900/20", icon: "🧬", val: abundance.human }
                 ].map((item, i) => (
                   <div key={i} className="relative group">
                     <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">
                       <span className="flex items-center gap-2"><span className="text-base">{item.icon}</span> {item.label}</span>
                       <span className="font-mono">
                          <span className="text-white font-bold">{item.val.text}</span>
                          <span className="text-[10px] text-blue-400 ml-2">({item.val.percent}%)</span>
                       </span>
                     </div>
                     <div className={`h-3 w-full bg-gradient-to-r ${item.track} to-slate-800/50 rounded-full overflow-hidden border border-white/5`}>
                       <motion.div 
                         initial={{ width: 0 }} 
                         whileInView={{ width: `${item.val.percent}%` }} 
                         transition={{ duration: 1.5, delay: 0.2 }}
                         className={`h-full ${item.color} shadow-[0_0_15px_currentColor] relative`}
                       >
                         <div className="absolute inset-0 bg-white/20 w-full -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                       </motion.div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </motion.div>
        </div>
      </div>

      {/* --- TECHNICAL DATA GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <DataCard title="Atomic Structure" icon="⚛️">
            <DataRow label="Atomic Mass" value={`${elementData?.atomic_mass} u`} />
            <DataRow label="Electron Config" value={<span className="font-mono text-[10px]">{elementData?.electron_configuration}</span>} />
            <DataRow label="Electronegativity" value={elementData?.electronegativity_pauling || "N/A"} />
         </DataCard>

         <DataCard title="Chemical Registry" icon="🧪">
            <DataRow label="IUPAC Name" value={elementData?.name.toUpperCase()} />
            <DataRow label="Symbol" value={elementData?.symbol} />
            <DataRow label="Category" value={elementData?.category} />
         </DataCard>

         <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 flex flex-col md:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
               <span className="text-xl">🐚</span>
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Electron Shells</h4>
            </div>
            <div className="flex-1 flex items-center justify-center relative">
               <div className="relative w-32 h-32 flex items-center justify-center">
                  <div className="absolute w-4 h-4 bg-yellow-500 rounded-full shadow-[0_0_15px_yellow] z-10" />
                  {elementData?.shells?.map((count, i) => (
                     <div key={i} className="absolute border border-blue-500/30 rounded-full flex items-center justify-center text-[8px] text-blue-300 font-mono"
                        style={{ width: `${(i + 1) * 30 + 10}px`, height: `${(i + 1) * 30 + 10}px` }}>
                        <span className="bg-slate-900 px-0.5 -mt-[100%]">{count}</span>
                     </div>
                  ))}
               </div>
            </div>
            <div className="text-center mt-4 text-xs text-slate-500 font-mono">
               Shells: {elementData?.shells?.join(" - ")}
            </div>
         </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const DataCard = ({ title, icon, children }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors">
     <div className="flex items-center gap-3 mb-6"><span className="text-xl">{icon}</span><h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h4></div>
     <div className="space-y-3">{children}</div>
  </motion.div>
);

const DataRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
     <span className="text-slate-500 text-xs font-medium uppercase">{label}</span><span className="text-slate-200 text-sm font-semibold">{value}</span>
  </div>
);

// --- API HELPERS ---

const extractPubChemUses = (json) => {
  try {
     const sections = json.Record.Section;
     const usesSection = sections.find(s => s.TOCHeading === "Uses" || s.TOCHeading === "Applications" || s.TOCHeading === "Use and Manufacturing");
     if (usesSection) {
        if (usesSection.Information) return usesSection.Information.map(info => info.Value.StringWithMarkup?.[0]?.String).filter(Boolean);
        if (usesSection.Section) {
           const sub = usesSection.Section[0];
           if (sub.Information) return sub.Information.map(info => info.Value.StringWithMarkup?.[0]?.String).filter(Boolean);
        }
     }
     return null;
  } catch (e) { return null; }
};

const getPhaseIcon = (phase) => {
  const p = phase?.toLowerCase() || "";
  if (p === "gas") return "☁️";
  if (p === "liquid") return "💧";
  if (p === "solid") return "💎";
  return "⚛️";
};

// --- DISCOVERY FIXER (The Logic to fix "Unknown Year") ---
const getDiscoveryInfo = (number, rawBy, rawYear) => {
  const num = parseInt(number);
  const ancientElements = [26, 29, 47, 79, 82, 50, 16, 6, 51, 80]; // Fe, Cu, Ag, Au, Pb, Sn, S, C, Sb, Hg
  
  // 1. Manually Override known missing dates from the API
  const overrides = {
    1: { by: "Henry Cavendish", year: "1766" },
    2: { by: "Pierre Janssen & Norman Lockyer", year: "1868" }, // Helium Fixed
    3: { by: "Johan August Arfwedson", year: "1817" },
    4: { by: "Louis Nicolas Vauquelin", year: "1798" },
    5: { by: "Joseph Louis Gay-Lussac", year: "1808" },
    7: { by: "Daniel Rutherford", year: "1772" },
    8: { by: "Joseph Priestley", year: "1774" },
    9: { by: "Henri Moissan", year: "1886" },
    11: { by: "Humphry Davy", year: "1807" },
    12: { by: "Joseph Black", year: "1755" },
    13: { by: "Hans Christian Ørsted", year: "1825" },
    14: { by: "Jöns Jacob Berzelius", year: "1824" }, // Silicon Fixed
    15: { by: "Hennig Brand", year: "1669" },
    17: { by: "Carl Wilhelm Scheele", year: "1774" },
    18: { by: "Lord Rayleigh & William Ramsay", year: "1894" },
    19: { by: "Humphry Davy", year: "1807" },
    20: { by: "Humphry Davy", year: "1808" },
    22: { by: "William Gregor", year: "1791" }, // Titanium Fixed
    24: { by: "Louis Nicolas Vauquelin", year: "1797" }, // Chromium Fixed
    25: { by: "Johan Gadolin", year: "1774" },
    27: { by: "Georg Brandt", year: "1735" },
    28: { by: "Axel Fredrik Cronstedt", year: "1751" },
    30: { by: "Andreas Sigismund Marggraf", year: "1746" },
    92: { by: "Martin Heinrich Klaproth", year: "1789" },
  };

  if (overrides[num]) return overrides[num];
  
  if (ancientElements.includes(num)) return { by: "Unknown (Prehistoric)", year: "Ancient Times" };
  
  return { 
    by: rawBy || "Unknown Scientist", 
    year: rawYear || "Unknown Year" 
  };
};
// --- NEW CALCULATORS FOR THE 3 CARDS ---

// 1. COSMIC ORIGIN: Determines where the element was created in the universe
const getOriginData = (n) => {
  const num = parseInt(n);
  if (!num) return { text: "Unknown", icon: "❓" };
  
  if (num <= 2) return { text: "Big Bang", icon: "💥" }; // Hydrogen, Helium
  if (num <= 5) return { text: "Cosmic Rays", icon: "🌠" }; // Lithium, Beryllium, Boron
  if (num <= 26) return { text: "Large Stars", icon: "🌟" }; // Carbon to Iron
  if (num <= 94 && num !== 43 && num !== 61) return { text: "Supernova", icon: "🎆" }; // Heavier natural elements
  return { text: "Human Lab", icon: "🧪" }; // Synthetic elements
};

// 2. RADIOACTIVITY: Checks if the element is naturally unstable
const getRadioactivity = (n) => {
  const num = parseInt(n);
  if (!num) return { text: "Unknown", icon: "❓", color: "text-slate-400" };

  // Technetium (43), Promethium (61), and everything after Bismuth (83) are radioactive
  if (num === 43 || num === 61 || num >= 84) {
    return { text: "Radioactive", icon: "☢️", color: "text-rose-400" };
  }
  return { text: "Stable", icon: "🛡️", color: "text-emerald-400" };
};

// 3. QUANTUM BLOCK: Determines the orbital block (s, p, d, f)
const getQuantumBlock = (group, num) => {
  const n = parseInt(num);
  const g = parseInt(group);
  
  // f-block (Lanthanides/Actinides)
  if ((n >= 57 && n <= 71) || (n >= 89 && n <= 103)) return "f";
  // s-block (Groups 1-2 + Helium)
  if (g <= 2 || n === 2) return "s";
  // p-block (Groups 13-18)
  if (g >= 13) return "p";
  // d-block (Transition Metals)
  return "d";
};