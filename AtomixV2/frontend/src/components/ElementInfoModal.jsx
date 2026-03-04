import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom"; 
import { funAssociations } from "../data/funAssociations"; 

const ELEMENT_DATA_URL = "https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json";

// --- ROBUST IMAGE SOURCE DEFINITIONS ---
const imageSources = [
  // 1. Primary Source: images-of-elements.com (Name based)
  (el) => `https://images-of-elements.com/${el.name.toLowerCase()}.jpg`,
  
  // 2. Secondary Source: periodictable.com (Theodore Gray's samples - Padded Number based)
  // Highly accurate real-world samples.
  (el) => {
      const num = el.number || el.atomicNumber;
      const paddedNum = String(num).padStart(3, '0');
      // s13.JPG is usually a good standard shot on their site
      return `https://periodictable.com/Samples/${paddedNum}.1/s13.JPG`;
  },

  // 3. Final Fallback: A generic scientific placeholder so it never looks broken.
  () => "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
];

export const ElementInfoModal = ({ element, onClose }) => {
  if (!element) return null;

  const [descriptionData, setDescriptionData] = useState(null);
  const [pubChemData, setPubChemData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // --- IMAGE STATE MANAGEMENT ---
  // Start trying from source index 0
  const [imageSourceIndex, setImageSourceIndex] = useState(0);
  
  // Get current URL based on the active index
  const currentImageUrl = imageSources[imageSourceIndex](element);
  
  // Translation State
  const [currentLang, setCurrentLang] = useState("en"); 
  const [translatedContent, setTranslatedContent] = useState(null); 
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Reset image source back to primary whenever the element changes
  useEffect(() => {
    setImageSourceIndex(0);
  }, [element]);

  // --- IMAGE ERROR HANDLER ---
  // If current source fails, try the next one in the list
  const handleImageError = () => {
    if (imageSourceIndex < imageSources.length - 1) {
        console.log(`Image source ${imageSourceIndex} failed for ${element.name}, trying next source.`);
        setImageSourceIndex(prev => prev + 1);
    }
  };

  // Keep the icon logic for visual flair
  const visualIconItem = funAssociations.find(f => f.symbol === element.symbol) 
    || { thing: "Industry", clue: "" };

  // --- API 1: Fetch General Summary ---
  const fetchGeneralData = async () => {
    try {
      const response = await fetch(ELEMENT_DATA_URL);
      const data = await response.json();
      const found = data.elements.find(e => e.name.toLowerCase() === element.name.toLowerCase());
      if (found) return found.summary;
    } catch (e) { return null; }
  };

  // --- API 2: Fetch Real World Uses (PubChem) ---
  const fetchPubChemData = async () => {
    try {
      const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${element.name}/JSON?heading=Uses`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("No data");
      const json = await res.json();
      const usageText = extractPubChemText(json);
      return usageText || "Specific application data not available in public records.";
    } catch (e) {
      return "Data unavailable directly from PubChem for this element.";
    }
  };

  const handleLoadDetails = async () => {
    if (descriptionData || loading) return;
    setLoading(true);
    const [summary, uses] = await Promise.all([
      fetchGeneralData(),
      fetchPubChemData()
    ]);
    setDescriptionData(summary || element.description);
    setPubChemData(uses);
    if (currentLang !== 'en') translateText(summary, currentLang);
    setLoading(false);
  };

  const extractPubChemText = (json) => {
    try {
      const sections = json.Record.Section;
      const usesSection = sections.find(s => 
        s.TOCHeading.includes("Uses") || s.TOCHeading.includes("Application")
      );
      if (usesSection && usesSection.Information) {
        const info = usesSection.Information.find(i => i.Value && i.Value.StringWithMarkup);
        if (info) return info.Value.StringWithMarkup[0].String;
      }
      if (usesSection && usesSection.Section) {
         const subSection = usesSection.Section[0];
         const info = subSection.Information.find(i => i.Value && i.Value.StringWithMarkup);
         if (info) return info.Value.StringWithMarkup[0].String;
      }
      return null;
    } catch (e) { return null; }
  };

  const translateText = async (text, targetLang) => {
    if (targetLang === "en") {
      setTranslatedContent(null);
      return;
    }
    let safeText = text || "";
    if (safeText.length > 450) {
      const cutOff = safeText.substring(0, 450);
      safeText = cutOff.substring(0, cutOff.lastIndexOf(".")) + "."; 
    }
    setIsTranslating(true);
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(safeText)}&langpair=en|${targetLang}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.responseData) setTranslatedContent(data.responseData.translatedText);
    } catch (err) { setTranslatedContent("Translation error."); }
    setIsTranslating(false);
  };

  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode);
    const textToTranslate = descriptionData || element.description;
    translateText(textToTranslate, langCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()} 
        className="relative w-full max-w-4xl bg-[#0f172a] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-white/20 transition-all">✕</button>

        {/* LEFT SIDE: VISUALS */}
        <div className="w-full md:w-2/5 relative bg-black flex items-center justify-center overflow-hidden group min-h-[300px]">
          <div className={`absolute inset-0 opacity-30 ${getCategoryGradient(element.category)}`} />
          
          {/* UPDATED IMAGE TAG WITH ROBUST FALLBACK */}
          <img 
            src={currentImageUrl} 
            alt={element.name}
            onError={handleImageError}
            className="relative z-10 w-48 h-48 object-cover rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/10 group-hover:scale-110 transition-transform duration-700 bg-black/50"
          />
          
          <div className="absolute top-4 left-4 z-0 text-9xl font-black text-white/5 select-none leading-none">{element.number || element.atomicNumber}</div>
          <div className="absolute bottom-6 left-0 w-full text-center z-20 px-4">
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10">{element.symbol}</div>
              <div className="text-white/40 text-xs font-mono uppercase tracking-widest mt-1">{element.category}</div>
          </div>
        </div>

        {/* RIGHT SIDE: CONTENT */}
        <div className="w-full md:w-3/5 p-8 flex flex-col bg-slate-900/50 backdrop-blur-md overflow-y-auto">
          
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-4xl font-black text-white tracking-tight">{element.name}</h2>
            <div className="flex gap-1 bg-slate-800 p-1 rounded-lg border border-white/10">
               {['en', 'hi', 'gu', 'fr', 'ja'].map(lang => (
                 <button key={lang} onClick={() => handleLanguageChange(lang)} className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold uppercase transition-colors ${currentLang === lang ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-700 hover:text-white'}`}>{lang}</button>
               ))}
            </div>
          </div>

          <Link to={`/element/${element.name}`} className="self-start mb-6 px-3 py-1 bg-blue-600/20 text-blue-300 text-xs font-bold uppercase rounded-full hover:bg-blue-600 hover:text-white transition-all border border-blue-500/30">
              View Full Data Sheet →
          </Link>

          <div className="text-slate-400 leading-relaxed mb-8 border-l-2 border-blue-500/50 pl-4 text-sm min-h-[80px]">
              <AnimatePresence mode="wait">
                {isTranslating ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-purple-400">
                     <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"/> Translating...
                  </motion.div>
                ) : (
                  <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {translatedContent || descriptionData || element.description}
                  </motion.div>
                )}
              </AnimatePresence>
          </div>

          <div className="mt-auto space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                 <span className="flex items-center gap-2"><span className="text-lg">🏭</span> Real World Application</span>
                 {pubChemData && <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-blue-400 border border-blue-500/30">Source: PubChem</span>}
              </div>
              
              <div 
                onClick={handleLoadDetails}
                className={`
                  relative overflow-hidden rounded-xl p-4 border transition-all cursor-pointer group
                  ${pubChemData ? 'bg-slate-800 border-blue-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}
                `}
              >
                 <div className="flex items-start gap-4 relative z-10">
                    <div className="w-12 h-12 shrink-0 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl border border-white/5">
                      {getAppIcon(visualIconItem.thing)}
                    </div>
                    
                    <div className="flex-1">
                       {loading ? (
                         <div className="flex flex-col gap-2 mt-2">
                            <div className="h-2 w-3/4 bg-white/10 rounded animate-pulse"/>
                            <div className="h-2 w-1/2 bg-white/10 rounded animate-pulse"/>
                         </div>
                       ) : (
                         <>
                            {pubChemData ? (
                              <div className="text-slate-300 text-xs leading-relaxed font-medium animate-in fade-in duration-500">
                                {pubChemData.length > 150 ? pubChemData.substring(0, 150) + "..." : pubChemData}
                              </div>
                            ) : (
                              <div>
                                <div className="text-white font-bold text-lg mb-1">{visualIconItem.thing || "Unknown"}</div>
                                <div className="text-slate-400 text-xs">Used in {element.category ? element.category.toLowerCase() : "various"} applications.</div>
                              </div>
                            )}
                         </>
                       )}
                    </div>
                 </div>

                 {!pubChemData && !loading && (
                    <div className="mt-3 text-[10px] text-blue-400 text-right uppercase font-bold tracking-wider opacity-60 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-2">
                       <span>Load Official Data</span>
                       <span className="bg-blue-500/20 px-1 rounded">NIH</span>
                    </div>
                 )}
              </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const getAppIcon = (thing) => {
  const t = thing?.toLowerCase() || "";
  if (t.includes("battery") || t.includes("power")) return "🔋";
  if (t.includes("water") || t.includes("liquid")) return "💧";
  if (t.includes("light") || t.includes("bulb") || t.includes("laser")) return "💡";
  if (t.includes("bone") || t.includes("health") || t.includes("blood")) return "❤️";
  if (t.includes("computer") || t.includes("phone") || t.includes("chip")) return "💻";
  if (t.includes("coin") || t.includes("gold") || t.includes("wealth")) return "💰";
  if (t.includes("bomb") || t.includes("nuclear")) return "☢️";
  if (t.includes("industry") || t.includes("factory")) return "🏭";
  return "🔬"; 
};

const getCategoryGradient = (category) => {
  const cat = category?.toLowerCase() || "";
  if (cat.includes("alkali")) return "bg-red-600";
  if (cat.includes("noble")) return "bg-purple-600";
  if (cat.includes("nonmetal")) return "bg-blue-600";
  return "bg-slate-600";
};