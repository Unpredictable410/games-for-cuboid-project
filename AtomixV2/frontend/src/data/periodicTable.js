import rawData from './rawElements.json';

// 1. Create a lookup map for Discovery Years (since raw JSON misses them)
// "Ancient" means discovered before recorded history (e.g., Iron, Copper)
const discoveryYears = {
  1: "1766", // Hydrogen
  2: "1895", // Helium
  3: "1817", // Lithium
  4: "1797", // Beryllium
  5: "1808", // Boron
  6: "Ancient", // Carbon
  7: "1772", // Nitrogen
  8: "1774", // Oxygen
  9: "1886", // Fluorine
  10: "1898", // Neon
  11: "1807", // Sodium
  12: "1755", // Magnesium
  13: "1825", // Aluminium
  14: "1824", // Silicon
  15: "1669", // Phosphorus
  16: "Ancient", // Sulfur
  17: "1774", // Chlorine
  18: "1894", // Argon
  19: "1807", // Potassium
  20: "1808", // Calcium
  26: "Ancient", // Iron
  29: "Ancient", // Copper
  47: "Ancient", // Silver
  79: "Ancient", // Gold
  82: "Ancient", // Lead
};

export const periodicTableData = rawData.elements.map((element) => {
  return {
    // --- 1. GRID & ID DATA ---
    number: element.number, 
    xpos: element.xpos,     
    ypos: element.ypos,     
    
    // --- 2. DISPLAY DATA ---
    symbol: element.symbol,
    name: element.name,
    category: element.category ? element.category.charAt(0).toUpperCase() + element.category.slice(1) : "Unknown",
    
    // --- 3. GAME DETAILS ---
    phase: element.phase || "Unknown",
    description: element.summary,
    
    // --- 4. THE FIX: Map the year, or fallback to 'Unknown' ---
    year: discoveryYears[element.number] || "Unknown",

    // --- 5. GENERATED PLACEHOLDERS ---
    applications: [
      "Scientific Research", 
      "Industrial Use", 
      element.phase 
    ],
    
    funFact: `Did you know ${element.name} has an atomic mass of ${element.atomic_mass}?`
  };
});

// OPTIONAL: Manual Overrides for specific game flavor
const manualOverrides = {
  1: { 
    applications: ["Rocket Fuel", "Stars", "Water"],
    funFact: "75% of the universe is Hydrogen."
  },
  2: { 
    applications: ["Balloons", "MRI Cooling", "Lasers"],
    funFact: "Discovered on the Sun before Earth."
  },
  3: { 
    applications: ["Batteries", "Glass", "Ceramics"],
    funFact: "Soft enough to be cut with a kitchen knife."
  },
  4: { 
    applications: ["Space Telescopes", "Missiles", "X-Rays"],
    funFact: "It tastes sweet but is toxic!"
  },
  5: { 
    applications: ["Slime (Borax)", "Glass", "Eye Drops"],
    funFact: "Used to make green flames in fireworks."
  },
  6: { 
    applications: ["Life", "Diamonds", "Graphite"],
    funFact: "It is the basis of all known life."
  }
};

periodicTableData.forEach(el => {
  if (manualOverrides[el.number]) {
    Object.assign(el, manualOverrides[el.number]);
  }
});