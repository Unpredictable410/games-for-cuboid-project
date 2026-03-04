import { periodicTableData } from "../data/periodicTable"; 
import triviaData from "../data/elementTrivia.json"; 
import generalScienceData from "../data/generalScience.json"; 

const getElement = (id) => {
  return periodicTableData.find(e => e.number === id) || { number: id, symbol: "??", name: `Element ${id}`, category: "Unknown" };
};

// Global pool for smart cycling
let globalGeneralPool = [];
let globalGeneralIndex = 0;

const getNextGeneralQuestion = () => {
  if (globalGeneralPool.length === 0 || globalGeneralIndex >= globalGeneralPool.length) {
    globalGeneralPool = [...generalScienceData].sort(() => Math.random() - 0.5);
    globalGeneralIndex = 0;
  }
  const q = globalGeneralPool[globalGeneralIndex];
  globalGeneralIndex++;
  return q;
};

// --- MAIN EXPORT: Generate 3 Unique Questions ---
export const generateRoundDeck = (targetId) => {
  const target = getElement(targetId);
  const targetKey = String(targetId);
  const deck = [];
  const ROUND_LENGTH = 5; 

  // 1. SPECIFIC TRIVIA (Priority #1)
  if (triviaData[targetKey]) {
    const specificFacts = [...triviaData[targetKey]]; 
    shuffleArray(specificFacts);

    // Try to add 1 or 2 specific questions
    while (deck.length < 2 && specificFacts.length > 0) {
      const fact = specificFacts.pop();
      deck.push({
        q: `"${fact.q}"`,
        answer: target.name,
        options: shuffleArray(generateNameDistractors(target.name))
      });
    }
  }

  // 2. GENERAL SCIENCE (Priority #2)
  while (deck.length < ROUND_LENGTH) {
    // 20% chance to skip general question if we already have specific ones (adds variety)
    if (deck.length >= 2 && Math.random() > 0.8) break;

    const genQ = getNextGeneralQuestion();
    
    if (!deck.some(d => d.q === `${genQ.q}`)) {
      deck.push({
        q: `${genQ.q}`,
        answer: genQ.answer,
        options: shuffleArray([...genQ.options])
      });
    }
  }

  // 3. FALLBACKS (Priority #3 - Fill the rest)
  const fallbackTypes = [0, 1, 2]; 
  
  while (deck.length < ROUND_LENGTH) {
    const type = fallbackTypes[Math.floor(Math.random() * fallbackTypes.length)];
    let q, a, opts;

    if (type === 0) {
      q = `Which element has the symbol '${target.symbol}'?`;
      a = target.name;
      opts = generateNameDistractors(target.name);
    } else if (type === 1) {
      const cat = getSimpleCategory(target.category);
      q = `To which chemical group does ${target.name} belong?`;
      a = cat;
      opts = [cat, "Alkali Metal", "Noble Gas", "Transition Metal", "Nonmetal", "Halogen", "Metalloid"];
      opts = [...new Set(opts)].slice(0, 4); 
    } else {
      q = `What is the chemical symbol for ${target.name}?`;
      a = target.symbol;
      opts = generateSymbolDistractors(target.symbol);
    }

    if (!deck.some(d => d.q === q)) {
      deck.push({ q, answer: a, options: shuffleArray(opts) });
    }
  }

  return shuffleArray(deck);
};

// ... (Helpers remain the same)
const getSimpleCategory = (cat) => {
  const c = (cat || "").toLowerCase();
  if (c.includes("alkali")) return "Alkali Metal";
  if (c.includes("noble")) return "Noble Gas";
  if (c.includes("halogen")) return "Halogen";
  if (c.includes("transition")) return "Transition Metal";
  if (c.includes("nonmetal")) return "Nonmetal";
  if (c.includes("metalloid")) return "Metalloid";
  return "Metal"; 
};

const generateNameDistractors = (correct) => {
  const opts = [correct];
  while (opts.length < 4) {
    const r = periodicTableData[Math.floor(Math.random() * periodicTableData.length)];
    if (r.name !== correct && !opts.includes(r.name)) opts.push(r.name);
  }
  return opts;
};

const generateSymbolDistractors = (correct) => {
  const opts = [correct];
  while (opts.length < 4) {
    const r = periodicTableData[Math.floor(Math.random() * periodicTableData.length)];
    if (r.symbol !== correct && !opts.includes(r.symbol)) opts.push(r.symbol);
  }
  return opts;
};

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);