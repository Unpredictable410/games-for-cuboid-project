// Accurate abundance data (Mass Percentages)
// Source: CRC Handbook of Chemistry and Physics & NASA Datasets

export const getAbundanceData = (atomicNumber) => {
  const num = parseInt(atomicNumber);

  // ------------------------------------------------------------------
  // 1. UNIVERSE ABUNDANCE
  // ------------------------------------------------------------------
  // Hydrogen (74%) and Helium (24%) are 98% of the universe.
  // Oxygen, Carbon, Neon, Iron are the next "common" ones. 
  // Everything else is a tiny fraction.
  
  let univ = { percent: 0.0000001, text: "Extremely Rare" };

  const univMap = {
    1: 74,    // Hydrogen
    2: 24,    // Helium
    8: 1.0,   // Oxygen
    6: 0.5,   // Carbon
    10: 0.13, // Neon
    26: 0.11, // Iron
    7: 0.1,   // Nitrogen
    14: 0.07, // Silicon
    12: 0.06, // Magnesium
    16: 0.05, // Sulfur
  };

  if (univMap[num]) {
    univ = { percent: univMap[num], text: `Common (${univMap[num]}%)` };
  } else if (num === 3 || num === 4 || num === 5) {
    // Li, Be, B are surprisingly rare in the universe (burned in stars)
    univ = { percent: 0.0000001, text: "Rare (Stellar Burn)" }; 
  } else if (num < 92) {
    univ = { percent: 0.0001, text: "Trace Amount" };
  } else {
    univ = { percent: 0, text: "None (Synthetic)" };
  }


  // ------------------------------------------------------------------
  // 2. EARTH'S CRUST ABUNDANCE
  // ------------------------------------------------------------------
  // Elements 1-92 are natural. 43 and 61 are exceptions (radioactive/decayed).
  // 93+ are synthetic (Man-made).
  
  let earth = { percent: 0.0001, text: "Trace Mineral" };

  const crustMap = {
    8: 46.1,  // Oxygen
    14: 28.2, // Silicon
    13: 8.2,  // Aluminum
    26: 5.6,  // Iron
    20: 4.1,  // Calcium
    11: 2.3,  // Sodium
    12: 2.3,  // Magnesium
    19: 2.0,  // Potassium
    22: 0.57, // Titanium
    1: 0.14,  // Hydrogen
    15: 0.1,  // Phosphorus
    25: 0.1,  // Manganese
    9: 0.06,  // Fluorine
    56: 0.04, // Barium
    38: 0.04, // Strontium
    16: 0.03, // Sulfur
    6: 0.02,  // Carbon
    40: 0.01, // Zirconium
    23: 0.01, // Vanadium
    17: 0.01, // Chlorine
    24: 0.01, // Chromium
  };

  // Special cases for famous "Rare" elements
  const rareMap = [79, 78, 47, 80]; // Gold, Platinum, Silver, Mercury

  if (crustMap[num]) {
    earth = { percent: crustMap[num], text: `Common (${crustMap[num]}%)` };
  } 
  else if (num === 7) {
    earth = { percent: 78, text: "Atmosphere (78%)" }; // Nitrogen Rule
  } 
  else if (num === 18) {
    earth = { percent: 0.9, text: "Atmosphere (0.9%)" }; // Argon Rule
  }
  else if (rareMap.includes(num)) {
    earth = { percent: 0.000001, text: "Precious / Rare" };
  }
  else if (num === 43 || num === 61 || num >= 93) {
    earth = { percent: 0, text: "None (Synthetic)" }; // Tc, Pm, and transuranic
  }


  // ------------------------------------------------------------------
  // 3. HUMAN BODY ABUNDANCE (Mass)
  // ------------------------------------------------------------------
  // 99% is just 6 elements. 0.85% is another 5. The rest is trace.
  
  let human = { percent: 0, text: "None" };

  const bodyMap = {
    8: 65,    // Oxygen
    6: 18.5,  // Carbon
    1: 9.5,   // Hydrogen
    7: 3.2,   // Nitrogen
    20: 1.5,  // Calcium
    15: 1.0,  // Phosphorus
    19: 0.4,  // Potassium
    16: 0.3,  // Sulfur
    11: 0.2,  // Sodium
    17: 0.2,  // Chlorine
    12: 0.1,  // Magnesium
  };

  // Essential Trace Elements (We need them to live)
  const essentialTrace = [
    26, // Iron (Blood)
    30, // Zinc (Enzymes)
    29, // Copper
    53, // Iodine (Thyroid)
    34, // Selenium
    25, // Manganese
    42, // Molybdenum
    27, // Cobalt (B12)
    24, // Chromium
    9,  // Fluorine (Teeth)
    14, // Silicon
  ];

  // Toxic elements (Present but bad)
  const toxic = [82, 80, 33, 48]; // Lead, Mercury, Arsenic, Cadmium

  if (bodyMap[num]) {
    human = { percent: bodyMap[num], text: `Vital (${bodyMap[num]}%)` };
  } 
  else if (essentialTrace.includes(num)) {
    human = { percent: 0.01, text: "Vital Trace" };
  } 
  else if (toxic.includes(num)) {
    human = { percent: 0.0001, text: "Toxic Trace" };
  }
  else if (num > 92) {
    human = { percent: 0, text: "None" };
  } 
  else {
    human = { percent: 0, text: "Non-Essential" };
  }

  return { univ, earth, human };
};