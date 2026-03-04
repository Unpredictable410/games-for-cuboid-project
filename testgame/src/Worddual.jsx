import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";

// ==========================================
// 1. SOUND ENGINE (Utility)
// ==========================================
const playSound = (type) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;

  if (type === "punch") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.2);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === "correct") {
    osc.type = "square";
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.setValueAtTime(800, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === "error") {
    osc.type = "square";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === "win") {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    let time = now;
    notes.forEach((note) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "square";
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = note;
        g.gain.setValueAtTime(0.1, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        o.start(time);
        o.stop(time + 0.15);
        time += 0.1;
    });
  } else if (type === "lose") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.8);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.8);
    osc.start(now);
    osc.stop(now + 0.8);
  }
};

// ==========================================
// 2. PIXEL FACE COMPONENT
// ==========================================
const PixelFace = ({ skinColor, lives, isHit, isDead, isTurn, isSafe, accessory }) => {
  const [pupilX, setPupilX] = useState(0);
  
  useEffect(() => {
    if (isDead || isHit) { setPupilX(0); return; }
    const interval = setInterval(() => {
       const r = Math.random();
       if (r > 0.7) setPupilX(-5);      
       else if (r < 0.3) setPupilX(5);  
       else setPupilX(0);               
    }, 1200);
    return () => clearInterval(interval);
  }, [isDead, isHit]);

  // --- VISUAL LOGIC ---
  let eyeHeight = "12px";
  let mouthHeight = "4px"; 
  let mouthWidth = "30px";
  let mouthRadius = "0px"; 
  let faceColor = skinColor;
  let shake = "none";
  let overlay = "none";

  if (isDead) {
      eyeHeight = "4px"; mouthHeight = "2px"; mouthRadius = "0px"; faceColor = "#555";
  } else if (isHit) {
      eyeHeight = "10px"; mouthHeight = "12px"; mouthWidth = "12px"; mouthRadius = "50%";
      shake = "translate(2px, 2px)"; overlay = "rgba(255,0,0,0.5)"; 
  } else if (lives === 2) {
      overlay = "rgba(100, 50, 0, 0.2)";
  } else if (lives === 1) {
      mouthHeight = "6px"; mouthRadius = "4px 4px 0 0";
      shake = `rotate(${Math.sin(Date.now() / 50) * 2}deg)`; overlay = "rgba(255, 0, 0, 0.3)"; 
  }

  if (isSafe) { overlay = "rgba(0, 255, 0, 0.3)"; }

  return (
    <div className="face-container" style={{ transform: shake }}>
        <div className="damage-overlay" style={{ background: overlay }}></div>
        
        <div className="head" style={{ background: faceColor }}>
            <div className="hair"></div>
            
            <div className="eyes-row">
                <div className="eye-socket">
                    <div className="eye-white" style={{ height: eyeHeight }}>
                        {!isDead && <div className="pupil" style={{ transform: `translateX(${pupilX}px)` }}></div>}
                    </div>
                </div>
                <div className="eye-socket">
                    <div className="eye-white" style={{ height: eyeHeight }}>
                        {!isDead && <div className="pupil" style={{ transform: `translateX(${pupilX}px)` }}></div>}
                    </div>
                </div>
            </div>

            {/* --- ACCESSORIES --- */}
            {accessory === "shades" && (
                <div className="acc-shades"><div className="lens"></div><div className="bridge"></div><div className="lens"></div></div>
            )}
            {accessory === "goggles" && (
                <div className="acc-goggles">
                    <div className="strap"></div><div className="lens-frame"><div className="lens-glass"></div></div>
                    <div className="bridge"></div><div className="lens-frame"><div className="lens-glass"></div></div>
                </div>
            )}
            {accessory === "band" && <div className="acc-band"><div className="knot"></div></div>}
            {accessory === "cap" && <div className="acc-cap"><div className="visor"></div></div>}
            {accessory === "eyepatch" && <div className="acc-eyepatch"><div className="patch"></div><div className="string"></div></div>}
            {accessory === "mask" && <div className="acc-mask"></div>}
            {accessory === "crown" && <div className="acc-crown"><div className="jewel"></div></div>}
            {accessory === "vr" && <div className="acc-vr"><div className="light"></div></div>}

            <div className="nose"></div>
            <div className="mouth" style={{ width: mouthWidth, height: mouthHeight, borderRadius: mouthRadius }}></div>
        </div>

        <style>{`
            .face-container { width: 100%; height: 100%; position: relative; overflow: hidden; background: #222; }
            .damage-overlay { position: absolute; inset: 0; z-index: 10; pointer-events: none; transition: background 0.1s; }
            .head { width: 70%; height: 70%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 4px 4px 0 rgba(0,0,0,0.2); display: flex; flex-direction: column; align-items: center; transition: background 0.3s; }
            .hair { width: 104%; height: 20%; background: #111; margin-top: -2%; margin-bottom: 10px; }
            .eyes-row { display: flex; gap: 15px; margin-bottom: 10px; width: 100%; justify-content: center; position: relative; z-index: 2; }
            .eye-socket { width: 24px; height: 16px; background: rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; }
            .eye-white { width: 16px; background: #fff; position: relative; transition: height 0.1s; }
            .pupil { width: 6px; height: 6px; background: #000; position: absolute; top: 50%; left: 50%; margin-top: -3px; margin-left: -3px; transition: transform 0.2s; }
            .nose { width: 8px; height: 12px; background: rgba(0,0,0,0.2); margin-bottom: 8px; }
            .mouth { background: #5a2e2e; transition: all 0.1s; }

            /* ACCESSORIES */
            .acc-shades { position: absolute; top: 28px; width: 100%; display: flex; justify-content: center; align-items: center; z-index: 6; }
            .acc-shades .lens { width: 28px; height: 16px; background: #000; border: 1px solid #333; }
            .acc-shades .bridge { width: 8px; height: 4px; background: #000; margin-top: -8px; }

            .acc-goggles { position: absolute; top: 22px; width: 100%; display: flex; justify-content: center; align-items: center; z-index: 6; }
            .acc-goggles .strap { position: absolute; width: 104%; height: 6px; background: #444; z-index: -1; top: 8px; }
            .acc-goggles .lens-frame { width: 32px; height: 22px; background: #555; border-radius: 4px; display: flex; align-items: center; justify-content: center; border: 2px solid #222; }
            .acc-goggles .lens-glass { width: 22px; height: 12px; background: rgba(50, 255, 255, 0.5); box-shadow: inset 0 0 4px rgba(255,255,255,0.8); }
            .acc-goggles .bridge { width: 4px; height: 4px; background: #333; }

            .acc-band { position: absolute; top: 15px; width: 104%; height: 12px; background: #ef4444; z-index: 6; box-shadow: 0 2px 0 rgba(0,0,0,0.2); }
            .acc-band .knot { position: absolute; right: -8px; top: 4px; width: 10px; height: 20px; background: #ef4444; transform: rotate(20deg); border: 1px solid #991b1b; }

            .acc-cap { position: absolute; top: 0; width: 104%; height: 25px; background: #3b82f6; z-index: 6; }
            .acc-cap .visor { width: 120%; height: 8px; background: #1d4ed8; position: absolute; bottom: 0; left: -10%; border-bottom: 2px solid #1e3a8a; }

            .acc-eyepatch { position: absolute; top: 26px; width: 100%; z-index: 7; }
            .acc-eyepatch .patch { position: absolute; left: 28px; width: 26px; height: 20px; background: #000; border-radius: 40%; border: 2px solid #333; }
            .acc-eyepatch .string { position: absolute; top: 0; width: 100%; height: 2px; background: #000; transform: rotate(-15deg); }

            .acc-mask { position: absolute; bottom: 0; width: 60%; height: 35px; background: #fff; z-index: 5; border: 2px solid #ccc; border-radius: 5px 5px 0 0; }

            .acc-crown { position: absolute; top: -15px; width: 100%; height: 20px; background: #eab308; z-index: 7; clip-path: polygon(0% 100%, 20% 0%, 40% 100%, 60% 0%, 80% 100%, 100% 0%, 100% 100%); }
            
            .acc-vr { position: absolute; top: 25px; width: 80%; height: 25px; background: #333; z-index: 7; border: 2px solid #000; }
            .acc-vr .light { width: 4px; height: 4px; background: #0f0; position: absolute; right: 5px; top: 5px; box-shadow: 0 0 5px #0f0; }
        `}</style>
    </div>
  );
};

// ==========================================
// 3. MAIN APP LOGIC
// ==========================================

const FIST_EMOJI = "👊"; 

// Retro Palette Colors (MS Paint Style)
const PAINT_PALETTE = [
    "#fca5a5", "#fbbf24", "#22c55e", "#3b82f6", "#a855f7", 
    "#ef4444", "#94a3b8", "#f472b6", "#14b8a6", "#d97706",
    "#ffffff", "#000000", "#7f1d1d", "#1e3a8a", "#14532d"
];

// Accessories
const GEAR_LIST = ['none', 'shades', 'goggles', 'band', 'cap', 'eyepatch', 'mask', 'crown', 'vr'];

const CHARACTERS = [
  { id: 0, name: "David", color: "#fbbf24", skin: "#fca5a5" },
  { id: 1, name: "Viper",   color: "#22c55e", skin: "#86efac" },
  { id: 2, name: "Shadow",  color: "#94a3b8", skin: "#cbd5e1" },
  { id: 3, name: "Blaze",   color: "#ef4444", skin: "#fca5a5" }
];

function App() {
  const [gameState, setGameState] = useState("SETUP"); 
  const [dictionary, setDictionary] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [wordList, setWordList] = useState([]); 
  const [currentWord, setCurrentWord] = useState("LOADING...");
  const [usedWords, setUsedWords] = useState(new Set());
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef();

  // --- PLAYERS STATE ---
  const [players, setPlayers] = useState([
      { id: 0, name: CHARACTERS[0].name, charIndex: 0, lives: 3, isDead: false, isHit: false, isSafe: false, customName: false, accessory: null, customColor: null },
      { id: 1, name: CHARACTERS[1].name, charIndex: 1, lives: 3, isDead: false, isHit: false, isSafe: false, customName: false, accessory: null, customColor: null }
  ]);
  
  const [activeIdx, setActiveIdx] = useState(0); 
  const [timeLeft, setTimeLeft] = useState(20);
  const [winner, setWinner] = useState(null);
  
  const [matchHistory, setMatchHistory] = useState([]); 
  // eslint-disable-next-line no-unused-vars
  const [mistakeReport, setMistakeReport] = useState(null);
  const [punchInfo, setPunchInfo] = useState({ active: false, victimIdx: null, attackerIdx: null }); 
  const [combatLog, setCombatLog] = useState(""); 
  
  // --- CUSTOMIZATION STATE ---
  const [editingId, setEditingId] = useState(null); 
  const [tempName, setTempName] = useState("");
  const [tempColor, setTempColor] = useState("");
  const [tempAccessory, setTempAccessory] = useState(null);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json")
      .then((res) => { if (!res.ok) throw new Error("Failed"); return res.json(); })
      .then((data) => { setDictionary(data); })
      .catch(() => {
        const backup = { "REACT": 1, "CODE": 1, "GAME": 1, "DUEL": 1, "PIXEL": 1, "FIGHT": 1 };
        setDictionary(backup);
      });
  }, []);

  const updatePlayerCount = (count) => {
      setPlayers(prev => {
          const currentCount = prev.length;
          if (count === currentCount) return prev; 
          if (count > currentCount) {
              const newPlayers = [...prev];
              for (let i = currentCount; i < count; i++) {
                  newPlayers.push({
                      id: i,
                      name: CHARACTERS[i % CHARACTERS.length].name,
                      charIndex: i % CHARACTERS.length,
                      lives: 3, isDead: false, isHit: false, isSafe: false,
                      customName: false, accessory: null, customColor: null
                  });
              }
              return newPlayers;
          } else {
              return prev.slice(0, count);
          }
      });
  };

  // --- MODAL LOGIC ---
  const openEditModal = (idx) => {
      setEditingId(idx);
      const p = players[idx];
      setTempName(p.name);
      const color = p.customColor || CHARACTERS[p.charIndex].skin;
      setTempColor(color);
      setTempAccessory(p.accessory);
  };

  const saveCustomization = () => {
      const updated = [...players];
      const p = updated[editingId];
      p.name = tempName.toUpperCase() || `PLAYER ${editingId + 1}`;
      p.customName = true;
      p.customColor = tempColor;
      p.accessory = tempAccessory;
      setPlayers(updated);
      setEditingId(null);
  };

  const pickRandomWord = () => {
    if (!dictionary) return "START";
    const words = Object.keys(dictionary);
    let randomWord = "";
    while (randomWord.length < 4) randomWord = words[Math.floor(Math.random() * words.length)].toUpperCase();
    return randomWord;
  };

  const startGame = () => {
    if (!dictionary) return;
    playSound("correct"); 
    setGameState("TRANSITION");
    setTimeLeft(20); setWinner(null);
    setInput(""); setError(""); setCombatLog(""); 
    setMatchHistory([]); setMistakeReport(null); setEditingId(null);
    setPunchInfo({ active: false, victimIdx: null, attackerIdx: null });
    
    const newWord = pickRandomWord();
    setCurrentWord(newWord);
    setUsedWords(new Set([newWord])); 
    setPlayers(prev => prev.map(p => ({ ...p, lives: 3, isDead: false, isHit: false, isSafe: false })));
    const starter = Math.floor(Math.random() * players.length);
    setActiveIdx(starter);
    setTimeout(() => { setGameState("PLAYING"); inputRef.current?.focus(); }, 1000);
  };

  // --- GAME LOOP ---
  useEffect(() => {
    if (gameState !== "PLAYING") return;
    if (timeLeft === 0) { handleMistake("TIME'S UP!"); return; }
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const handleWordSubmit = () => {
    if (gameState !== "PLAYING") return; 
    const stem = currentWord.charAt(currentWord.length - 1);
    const word = (stem + input).trim().toUpperCase();
    if (word.length < 2) return handleMistake("TOO SHORT");
    if (word.charAt(0) !== stem) return handleMistake(`START WITH ${stem}`);
    if (usedWords.has(word)) return handleMistake("ALREADY USED");
    if (dictionary && !dictionary[word.toLowerCase()]) return handleMistake("UNKNOWN WORD");
    submitSuccess(word);
  };

  const submitSuccess = (validWord) => {
    playSound("correct");
    setCurrentWord(validWord);
    setUsedWords(prev => new Set(prev).add(validWord));
    setMatchHistory(prev => [...prev, { playerIdx: activeIdx, word: validWord }]);
    setInput(""); setError(""); setTimeLeft(20);
    const updated = [...players]; updated[activeIdx].isSafe = true; setPlayers(updated);
    setTimeout(() => { setPlayers(prev => { const r = [...prev]; if(r[activeIdx]) r[activeIdx].isSafe = false; return r; }); }, 300);
    advanceTurn();
  };

  const advanceTurn = () => {
      let nextIdx = (activeIdx + 1) % players.length;
      while (players[nextIdx].isDead) {
          nextIdx = (nextIdx + 1) % players.length;
          if (nextIdx === activeIdx) break; 
      }
      setActiveIdx(nextIdx);
      setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleMistake = (msg) => {
    setError(msg); playSound("error");
    setMistakeReport({ playerIdx: activeIdx, reason: msg, word: input || "(NOTHING)" });
    const victim = activeIdx;
    let attacker = (activeIdx - 1 + players.length) % players.length;
    while (players[attacker].isDead && attacker !== victim) { attacker = (attacker - 1 + players.length) % players.length; }
    runPunchSequence(attacker, victim);
  };

  const runPunchSequence = (attackerIdx, victimIdx) => {
    setGameState("ANIMATING"); 
    setPunchInfo({ active: true, victimIdx: victimIdx, attackerIdx: attackerIdx });
    setInput("");
    setCombatLog(`${players[attackerIdx].name} PUNCHED ${players[victimIdx].name}!`);
    setTimeout(() => { setCombatLog(""); }, 3000);
    setTimeout(() => { playSound("punch"); }, 200);
    setTimeout(() => {
      const updated = [...players];
      updated[victimIdx].lives -= 1;
      if (updated[victimIdx].lives <= 0) { updated[victimIdx].isDead = true; updated[victimIdx].lives = 0; }
      setPlayers(updated);
      const survivors = updated.filter(p => !p.isDead);
      if (survivors.length <= 1) {
          setWinner(survivors[0] ? survivors[0].name : "NO ONE");
          playSound("win"); setGameState("GAMEOVER"); 
          setPunchInfo({ active: false, victimIdx: null, attackerIdx: null });
      } else {
          advanceTurn(); setGameState("PLAYING");
          setPunchInfo({ active: false, victimIdx: null, attackerIdx: null });
          setTimeLeft(20);
      }
    }, 1500); 
  };

  const stem = currentWord ? currentWord.charAt(currentWord.length - 1) : "?";
  const renderHealth = (lives) => (
    <div className="hp-bar-container">
        {[1, 2, 3].map(i => <div key={i} className={`hp-segment ${i <= lives ? 'filled' : 'empty'}`}></div>)}
    </div>
  );

  return (
    <div className="app-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400;500&display=swap');
        body { margin: 0; background: #050505; overflow: hidden; user-select: none; }
        .app-container { width: 100vw; height: 100vh; position: relative; background: radial-gradient(circle at center, #2a1b3d 0%, #000 90%); font-family: 'Press Start 2P', cursive; color: white; }
        .scanlines { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 999; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 2px, 3px 100%; }
        
        /* BUTTONS */
        .retro-btn { font-family: 'Press Start 2P', cursive; padding: 15px 30px; font-size: 1.2rem; color: #fff; background: #22c55e; border: none; cursor: pointer; box-shadow: 0 6px 0 #15803d; transition: transform 0.1s; text-transform: uppercase; margin: 10px; }
        .retro-btn:active { transform: translateY(6px); box-shadow: none; }
        .retro-btn.setup { background: #3b82f6; box-shadow: 0 6px 0 #1d4ed8; font-size: 1rem; padding: 10px 20px; }
        .retro-btn.selected { background: #eab308; box-shadow: 0 6px 0 #a16207; color: #000; }
        .retro-btn.cancel { background: #ef4444; box-shadow: 0 6px 0 #991b1b; }
        
        /* MODAL - CLASSIC COMPACT CARD */
        .modal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; }
        .modal-card { 
            background: #1a1a1a; border: 4px solid #fff; padding: 25px;
            display: flex; gap: 30px;
            width: 780px; 
            box-shadow: 0 20px 50px #000; font-family: 'VT323', monospace; color: white;
        }
        
        .modal-col-left { flex: 0.5; display: flex; flex-direction: column; align-items: center; border-right: 2px solid #333; padding-right: 25px; }
        
        .modal-col-right { 
            flex: 1; display: flex; flex-direction: column; gap: 15px; 
        }
        
        .modal-label { color: #facc15; font-size: 1.5rem; border-bottom: 2px solid #333; margin-bottom: 5px; text-transform: uppercase; }
        
        /* CLICKABLE COLOR BAR (INPUT WRAPPER) */
        .color-picker-wrapper { 
            width: 100%; height: 40px; 
            border: 2px solid #fff; 
            margin-bottom: 10px; 
            box-shadow: inset 3px 3px 0 rgba(255,255,255,0.2), inset -3px -3px 0 rgba(0,0,0,0.5); 
            position: relative;
            cursor: pointer;
        }
        .color-picker-wrapper:hover { border-color: #facc15; }
        .native-color-input {
            position: absolute; inset: 0; width: 100%; height: 100%; 
            opacity: 0; cursor: pointer;
        }

        /* PALETTE GRID */
        .color-palette { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 5px; }
        .color-swatch { 
            width: 40px; height: 40px; cursor: pointer; transition: transform 0.1s; 
            box-shadow: inset 2px 2px 0 rgba(255,255,255,0.5), inset -2px -2px 0 rgba(0,0,0,0.5); 
        }
        .color-swatch:hover { transform: scale(1.1); z-index: 5; }
        .color-swatch.active { outline: 2px solid #fff; z-index: 10; box-shadow: inset 2px 2px 0 rgba(0,0,0,0.8); }

        /* GEAR BOX */
        .acc-grid-container {
            flex: 1; overflow-y: auto; background: #000; border: 4px inset #444; padding: 10px;
            height: 120px; 
        }
        .acc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .acc-btn { 
            background: #333; border: 2px solid #555; color: #fff; padding: 10px; 
            cursor: pointer; font-family: 'VT323'; font-size: 1.2rem; text-transform: uppercase; text-align: center;
        }
        .acc-btn:hover { background: #444; }
        .acc-btn.selected { border-color: #22c55e; background: #064e3b; box-shadow: inset 0 0 10px #22c55e; color: #4ade80; }

        .name-input-modal { 
            background: #222; border: 2px solid #555; font-family: 'Press Start 2P'; 
            font-size: 1rem; padding: 10px; width: 100%; color: white; box-sizing: border-box; 
        }
        
        /* GRID SYSTEM */
        .game-grid { position: absolute; inset: 0; pointer-events: none; }
        .game-grid.setup-mode { display: flex; justify-content: center; align-items: center; gap: 30px; height: 40%; top: 25%; }
        .game-grid.setup-mode .player-slot { position: relative; transform: scale(1.1); opacity: 1; filter: none; }

        .game-grid.game-mode .player-slot { transform: scale(0.9); transition: all 0.5s; opacity: 0.3; filter: grayscale(1) blur(2px); }
        .game-grid.game-mode .slot-0 { top: 15%; left: 10%; }    
        .game-grid.game-mode .slot-1 { top: 15%; right: 10%; }   
        .game-grid.game-mode .slot-2 { bottom: 15%; left: 10%; } 
        .game-grid.game-mode .slot-3 { bottom: 15%; right: 10%; }

        .game-mode .player-slot.focused { opacity: 1; filter: none; z-index: 20; transform: scale(1.05); }
        .player-slot.shaking { animation: shake 0.5s both; filter: drop-shadow(0 0 15px #ef4444) !important; }
        @keyframes shake { 10%, 90% { transform: translate3d(-2px, 0, 0); } 20%, 80% { transform: translate3d(4px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-8px, 0, 0); } 40%, 60% { transform: translate3d(8px, 0, 0); } }

        .player-slot { position: absolute; display: flex; flex-direction: column; align-items: center; gap: 5px; pointer-events: auto; }
        .portrait-frame { width: 150px; aspect-ratio: 1; background: #1a1a1a; border: 4px solid #444; padding: 6px; box-shadow: inset 0 0 20px #000; position: relative; transition: all 0.3s; }
        .player-slot.focused .portrait-frame { border-color: #fbbf24; box-shadow: 0 0 25px #fbbf24; }
        .player-slot.shaking .portrait-frame { border-color: #ef4444; }

        .hp-bar-container { width: 150px; display: flex; gap: 4px; height: 10px; margin-top: 5px; }
        .hp-segment { flex: 1; background: #333; border: 1px solid #555; transform: skewX(-20deg); }
        .hp-segment.filled { background: linear-gradient(180deg, #4ade80 0%, #22c55e 100%); border-color: #86efac; box-shadow: 0 0 5px #22c55e; }
        .hp-segment.empty { background: #330000; border-color: #550000; }

        .title { position: absolute; top: 5%; width: 100%; text-align: center; font-size: 3.5rem; color: #facc15; text-shadow: 4px 4px 0 #b45309; margin: 0; z-index: 5; }
        .setup-controls { position: absolute; bottom: 10%; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 10px; z-index: 50; }
        .hud-center { position: absolute; top: 12%; left: 50%; transform: translateX(-50%); text-align: center; z-index: 5; width: 100%; }
        .turn-label { font-family: 'VT323', monospace; font-size: 2rem; color: #00e0ff; text-transform: uppercase; text-shadow: 0 0 10px #00e0ff; margin-bottom: 5px; }
        .timer { font-size: 3.5rem; color: #fff; text-shadow: 3px 3px 0 #000; }
        .combat-log { font-size: 1.5rem; color: #ff00ff; text-shadow: 2px 2px 0 #000; margin-top: 10px; animation: flashText 0.2s infinite; font-family: 'VT323', monospace; white-space: nowrap; }
        @keyframes flashText { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        .bottom-area { position: absolute; bottom: 5%; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 10px; z-index: 50; }
        .history-row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; max-width: 60vw; margin-bottom: 10px; }
        .history-char { font-family: 'VT323', monospace; font-size: 2.5rem; color: #ccc; background: #111; padding: 4px 10px; border: 2px solid #444; box-shadow: 0 4px 0 #222; }
        .input-row { display: flex; gap: 10px; perspective: 500px; }
        .tile { width: 50px; height: 60px; background: #111; border: 2px solid #444; color: #00ff9d; display: flex; align-items: center; justify-content: center; font-family: 'VT323', monospace; font-size: 3rem; box-shadow: 0 5px 0 #000; transform: rotateX(10deg); }
        .tile.stem { background: #b45309; color: #fff; border-color: #f59e0b; }
        .cursor-box { width: 50px; height: 60px; border: 2px dashed #666; animation: blink 1s infinite; transform: rotateX(10deg); }
        .error { color: #ef4444; font-family: 'VT323', monospace; font-size: 2rem; height: 30px; text-shadow: 1px 1px 0 #000; }

        .pencil-icon { cursor: pointer; opacity: 0.5; width: 14px; height: 14px; fill: white; margin-left: 5px; }
        .pencil-icon:hover { opacity: 1; }
        .hidden-input { position: absolute; opacity: 0; top: -1000px; }
        .stats-table { width: 80%; background: #111; border: 2px solid #444; margin-bottom: 20px; border-collapse: collapse; font-family: 'VT323', monospace; font-size: 1.5rem; }
        .stats-table th, .stats-table td { border: 1px solid #333; padding: 10px; text-align: center; color: #aaa; }
      `}</style>
      
      <div className="scanlines"></div>
      
      <h1 className="title">WORD DUEL</h1>

      {/* --- CUSTOMIZATION MODAL --- */}
      {editingId !== null && (
          <div className="modal-overlay">
              <div className="modal-card">
                  {/* Left: Preview */}
                  <div className="modal-col-left">
                      <div className="modal-label">PREVIEW</div>
                      <div className="portrait-frame" style={{width:'200px', transform:'scale(1.1)'}}>
                          <PixelFace skinColor={tempColor} lives={3} isHit={false} isDead={false} isTurn={true} isSafe={false} accessory={tempAccessory} />
                      </div>
                  </div>

                  {/* Right: Controls */}
                  <div className="modal-col-right">
                      {/* 1. NAME */}
                      <div>
                          <div className="modal-label">IDENTITY</div>
                          <input className="name-input-modal" value={tempName} onChange={(e) => setTempName(e.target.value.toUpperCase())} placeholder="ENTER NAME" onFocus={e => e.target.select()} autoFocus />
                      </div>
                      
                      {/* 2. COLOR (CLICKABLE BAR) */}
                      <div>
                          <div className="modal-label">SKIN COLOR (PAINT)</div>
                          {/* The Big Bar is now an input wrapper */}
                          <div className="color-picker-wrapper" style={{backgroundColor: tempColor}}>
                              <input type="color" className="native-color-input" value={tempColor} onChange={(e) => setTempColor(e.target.value)} />
                          </div>
                          
                          {/* Palette Grid */}
                          <div className="color-palette">
                              {PAINT_PALETTE.map(c => (
                                  <div key={c} className={`color-swatch ${tempColor === c ? 'active' : ''}`} style={{backgroundColor: c}} 
                                       onClick={() => setTempColor(c)}></div>
                              ))}
                          </div>
                      </div>

                      {/* 3. GEAR (SCROLLABLE HERE) */}
                      <div style={{flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
                          <div className="modal-label">GEAR</div>
                          <div className="acc-grid-container">
                              <div className="acc-grid">
                                  {GEAR_LIST.map(acc => (
                                      <div key={acc} className={`acc-btn ${tempAccessory === (acc === 'none' ? null : acc) ? 'selected' : ''}`} 
                                           onClick={() => setTempAccessory(acc === 'none' ? null : acc)}>
                                          {acc}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>

                      <div style={{display:'flex', gap:10, marginTop:'auto'}}>
                          <button className="retro-btn cancel" style={{flex:1}} onClick={() => setEditingId(null)}>CANCEL</button>
                          <button className="retro-btn" style={{flex:1}} onClick={saveCustomization}>SAVE</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- PLAYERS GRID --- */}
      {(gameState !== "GAMEOVER") && (
        <div className={`game-grid ${gameState === "SETUP" ? "setup-mode" : "game-mode"}`}>
            <AnimatePresence>
                {players.map((player, idx) => {
                    const isMyTurn = idx === activeIdx && gameState === "PLAYING";
                    const isAttacker = punchInfo.active && idx === punchInfo.attackerIdx;
                    const isVictim = punchInfo.active && idx === punchInfo.victimIdx;
                    const isFocused = gameState === "SETUP" || isMyTurn || isAttacker || isVictim;
                    
                    const skin = player.customColor || CHARACTERS[player.charIndex].skin;

                    return (
                        <motion.div 
                            key={player.id} 
                            layout 
                            className={`player-slot slot-${idx} ${isFocused ? 'focused' : ''} ${isVictim ? 'shaking' : ''}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 60, damping: 15 }}
                        >
                            <div className="portrait-frame">
                                <PixelFace skinColor={skin} lives={player.lives} isHit={isVictim} isDead={player.isDead} isTurn={isMyTurn} isSafe={player.isSafe} accessory={player.accessory} />
                                <AnimatePresence>
                                    {punchInfo.active && isAttacker && (
                                        <motion.div 
                                            initial={{ scale: 0.5, x: 0, y: 0 }} 
                                            animate={{ scale: 1.5, x: 50, y: 0 }} 
                                            exit={{ opacity: 0 }} 
                                            style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'6rem', zIndex:100}}
                                        >
                                            {FIST_EMOJI}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            
                            {gameState !== "SETUP" && renderHealth(player.lives)}

                            <div style={{display:'flex', alignItems:'center', marginTop:5}}>
                                <div style={{color: CHARACTERS[player.charIndex].color, fontSize:'1rem', textShadow:'2px 2px 0 #000'}}>
                                    {player.name}
                                    {gameState === "SETUP" && (
                                        <svg className="pencil-icon" viewBox="0 0 24 24" onClick={() => openEditModal(idx)}>
                                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
      )}

      {/* --- SETUP BUTTONS --- */}
      {gameState === "SETUP" && (
          <div className="setup-controls">
              <div style={{fontFamily:'VT323', fontSize:'2rem', color:'#fff'}}>SELECT PLAYERS</div>
              <div style={{display:'flex', gap:10}}>
                  {[2, 3, 4].map(n => (
                      <button key={n} className={`retro-btn setup ${players.length===n?'selected':''}`} onClick={() => updatePlayerCount(n)}>
                          {n} P
                      </button>
                  ))}
              </div>
              <button className="retro-btn" style={{marginTop: 10}} onClick={startGame}>START GAME</button>
          </div>
      )}

      {/* --- HUD & INPUT --- */}
      {(gameState === "PLAYING" || gameState === "ANIMATING" || gameState === "TRANSITION") && (
        <>
            <div className="hud-center">
                <div className="turn-label" style={{color: CHARACTERS[players[activeIdx].charIndex].color}}>
                    {`<< ${players[activeIdx].name}'S TURN >>`}
                </div>
                <div className="timer" style={{color: timeLeft<=5?'#ef4444':'#fff'}}>{timeLeft}</div>
                {combatLog && <div className="combat-log">{combatLog}</div>}
            </div>

            <div className="bottom-area" onClick={() => inputRef.current?.focus()}>
                <div className="history-row">{currentWord.split("").map((c,i) => <span key={i} className="history-char">{c}</span>)}</div>
                <div className="error">{error}</div>
                <div className="input-row">
                    <div className="tile stem">{stem}</div>
                    {input.split("").map((c,i) => <div key={i} className="tile">{c}</div>)}
                    <div className="cursor-box"></div>
                </div>
            </div>
            
            <input ref={inputRef} className="hidden-input" value={input} onChange={e => gameState==="PLAYING" && setInput(e.target.value.toUpperCase())} onKeyDown={e => e.key==="Enter" && handleWordSubmit()} onBlur={() => gameState==="PLAYING" && setTimeout(() => inputRef.current?.focus(), 10)} />
        </>
      )}

      {/* --- GAME OVER --- */}
      {gameState === "GAMEOVER" && (
         <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.95)', zIndex:2000, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
            <h1 style={{fontSize:'3rem', color:'#4ade80', margin:'0 0 20px 0', textShadow:'0 0 20px currentColor'}}>{winner} WINS!</h1>
            
            <div style={{maxHeight:'50%', overflowY:'auto', width:'100%', display:'flex', justifyContent:'center'}}>
                <table className="stats-table">
                    <thead><tr><th>PLAYER</th><th>WORDS</th></tr></thead>
                    <tbody>
                        {players.map((p, i) => (
                            <tr key={i}>
                                <td style={{color: CHARACTERS[p.charIndex].color}}>{p.name}</td>
                                <td>{matchHistory.filter(m => m.playerIdx === i).map(m => m.word).join(", ")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button className="retro-btn" onClick={() => setGameState("SETUP")}>MAIN MENU</button>
         </div>
      )}
    </div>
  );
}

// ==========================================
// 4. MOUNT TO DOM
// ==========================================
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

export default App;