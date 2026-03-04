import React, { useState } from 'react';
import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

// ==========================================
// 1. GAME STORE & LOGIC
// ==========================================

// --- HELPERS ---

const checkWallCollision = (walls, newWall) => {
  return walls.some(w => {
    if (w.x === newWall.x && w.y === newWall.y) return true;
    if (w.orientation === newWall.orientation) {
       if (w.orientation === 'h' && w.y === newWall.y && Math.abs(w.x - newWall.x) < 2) return true;
       if (w.orientation === 'v' && w.x === newWall.x && Math.abs(w.y - newWall.y) < 2) return true;
    }
    return false;
  });
};

const isStepBlocked = (x1, y1, x2, y2, walls) => {
  if (y1 === y2) { // Horizontal Move
    const wallX = Math.min(x1, x2); 
    const wallY = y1;
    return walls.some(w => w.orientation === 'v' && w.x === wallX && (w.y === wallY || w.y === wallY - 1));
  }
  if (x1 === x2) { // Vertical Move
    const wallX = x1;
    const wallY = Math.min(y1, y2);
    return walls.some(w => w.orientation === 'h' && w.y === wallY && (w.x === wallX || w.x === wallX - 1));
  }
  return true;
};

// BFS Pathfinding (Anti-Lock)
const hasPathToGoal = (startX, startY, goalRow, walls) => {
  const queue = [{x: startX, y: startY}];
  const visited = new Set([`${startX},${startY}`]);
  const directions = [{dx:0, dy:1}, {dx:0, dy:-1}, {dx:1, dy:0}, {dx:-1, dy:0}];

  while(queue.length > 0) {
    const curr = queue.shift();
    if (curr.y === goalRow) return true;

    for (const d of directions) {
      const nx = curr.x + d.dx;
      const ny = curr.y + d.dy;
      
      if (nx >= 0 && nx <= 8 && ny >= 0 && ny <= 8) {
        if (!isStepBlocked(curr.x, curr.y, nx, ny, walls)) {
          const key = `${nx},${ny}`;
          if (!visited.has(key)) {
            visited.add(key);
            queue.push({x: nx, y: ny});
          }
        }
      }
    }
  }
  return false;
};

// STRICT QUORIDOR LOGIC
const calculateValidMoves = (player, opponent, walls) => {
  const moves = [];
  const directions = [{dx:0, dy:1}, {dx:0, dy:-1}, {dx:1, dy:0}, {dx:-1, dy:0}];

  directions.forEach(dir => {
    const nx = player.x + dir.dx;
    const ny = player.y + dir.dy;

    // A. Bounds Check
    if (nx >= 0 && nx <= 8 && ny >= 0 && ny <= 8) {
      // B. Wall Check (Immediate Step)
      if (!isStepBlocked(player.x, player.y, nx, ny, walls)) {
        // C. Opponent Handling (Jump Logic)
        if (nx === opponent.x && ny === opponent.y) {
          // Face-to-Face! Try Straight Jump first.
          const jumpX = nx + dir.dx;
          const jumpY = ny + dir.dy;
          
          const canStraightJump = 
            jumpX >= 0 && jumpX <= 8 && jumpY >= 0 && jumpY <= 8 && 
            !isStepBlocked(nx, ny, jumpX, jumpY, walls);

          if (canStraightJump) {
            moves.push({ x: jumpX, y: jumpY });
          } else {
            // Straight jump blocked? Try Diagonals.
            const diags = dir.dx === 0 
              ? [{dx:1, dy:0}, {dx:-1, dy:0}] // If moving Vertically, look Left/Right
              : [{dx:0, dy:1}, {dx:0, dy:-1}]; // If moving Horiz, look Up/Down

            diags.forEach(diag => {
              const diagX = nx + diag.dx;
              const diagY = ny + diag.dy;
              
              if (diagX >= 0 && diagX <= 8 && diagY >= 0 && diagY <= 8) {
                 if (!isStepBlocked(nx, ny, diagX, diagY, walls)) {
                   moves.push({ x: diagX, y: diagY });
                 }
              }
            });
          }
        } else {
          moves.push({ x: nx, y: ny });
        }
      }
    }
  });
  return moves;
};

// --- STORE DEFINITION ---
export const useGameStore = create((set, get) => ({
  gameState: 'lobby',
  turn: 'p1',
  winner: null,
  validMoves: [],
  
  players: {
    p1: { x: 4, y: 0, color: '#ef4444', name: 'Player 1', walls: 10, steps: 0, avatar: '🦁' },
    p2: { x: 4, y: 8, color: '#3b82f6', name: 'Player 2', walls: 10, steps: 0, avatar: '🐯' },
  },

  walls: [],

  setPlayerInfo: (pid, key, value) => set((state) => ({
    players: { ...state.players, [pid]: { ...state.players[pid], [key]: value } }
  })),

  startGame: () => {
    const state = get();
    const initialMoves = calculateValidMoves(
      { x:4, y:0 }, 
      { x:4, y:8 }, 
      []
    );
    
    set({ 
      gameState: 'playing', 
      walls: [], 
      turn: 'p1', 
      winner: null,
      validMoves: initialMoves,
      players: {
        p1: { ...state.players.p1, x: 4, y: 0, walls: 10, steps: 0 },
        p2: { ...state.players.p2, x: 4, y: 8, walls: 10, steps: 0 }
      }
    });
  },

  movePlayer: (x, y) => {
    const { gameState, turn, players, walls, validMoves } = get();
    if (gameState !== 'playing') return;

    const isValid = validMoves.some(m => m.x === x && m.y === y);
    if (!isValid) return;

    const current = players[turn];
    const nextTurn = turn === 'p1' ? 'p2' : 'p1';
    
    const nextPlayers = { 
      ...players, 
      [turn]: { ...current, x, y, steps: current.steps + 1 } 
    };

    if (turn === 'p1' && y === 8) return set({ gameState: 'winner', winner: 'p1', players: nextPlayers });
    if (turn === 'p2' && y === 0) return set({ gameState: 'winner', winner: 'p2', players: nextPlayers });

    const nextMoves = calculateValidMoves(nextPlayers[nextTurn], nextPlayers[turn], walls);

    set({ players: nextPlayers, turn: nextTurn, validMoves: nextMoves });
  },

  placeWall: (wall) => {
    const { gameState, turn, players, walls } = get();
    if (gameState !== 'playing' || players[turn].walls <= 0) return;

    if (checkWallCollision(walls, wall)) return;

    // Anti-Lock Check
    const testWalls = [...walls, { ...wall, owner: turn }];
    const p1CanReach = hasPathToGoal(players.p1.x, players.p1.y, 8, testWalls);
    const p2CanReach = hasPathToGoal(players.p2.x, players.p2.y, 0, testWalls);

    if (!p1CanReach || !p2CanReach) {
      console.warn("Placement blocked: Path Blocked");
      return; 
    }

    const nextTurn = turn === 'p1' ? 'p2' : 'p1';
    const nextMoves = calculateValidMoves(players[nextTurn], players[turn], testWalls);

    set((state) => ({
      walls: testWalls,
      players: { ...state.players, [turn]: { ...state.players[turn], walls: state.players[turn].walls - 1 } },
      turn: nextTurn,
      validMoves: nextMoves
    }));
  }
}));

// ==========================================
// 2. COMPONENTS
// ==========================================

// --- PlayerCard ---
const AVATARS = ['🦁', '🐯', '🐼', '🦊', '👽', '🤖'];
const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const PlayerCard = ({ pid, isLobby }) => {
  const players = useGameStore((state) => state.players);
  const setPlayerInfo = useGameStore((state) => state.setPlayerInfo);
  const turn = useGameStore((state) => state.turn);
  
  const player = players[pid];
  const isActive = turn === pid;

  return (
    <motion.div 
      layoutId={`card-${pid}`}
      className={`player-card ${isActive && !isLobby ? 'active' : ''}`}
    >
      <div className="avatar" style={{ background: player.color }}>{player.avatar}</div>
      
      {isLobby ? (
        <input 
          type="text" 
          className="name-input"
          value={player.name}
          onChange={(e) => setPlayerInfo(pid, 'name', e.target.value)}
          maxLength={12}
        />
      ) : (
        <h3 style={{ margin: '0 0 5px 0' }}>{player.name}</h3>
      )}
      
      {isLobby ? (
        <div style={{ marginTop: 20 }}>
           <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
             {AVATARS.map(a => <button key={a} onClick={() => setPlayerInfo(pid, 'avatar', a)} style={{border:'none', background:'transparent', fontSize:20, cursor:'pointer'}}>{a}</button>)}
           </div>
           <div style={{ display: 'flex', gap: 5 }}>
             {COLORS.map(c => <button key={c} onClick={() => setPlayerInfo(pid, 'color', c)} style={{width:25, height:25, background:c, borderRadius:'50%', border:'none', cursor:'pointer'}} />)}
           </div>
        </div>
      ) : (
        <div style={{display: 'flex', gap: 10, marginTop: 10}}>
          <div className="stat-badge" title="Walls Left">
             🧱 {player.walls}
          </div>
          <div className="stat-badge" title="Steps Taken">
             👣 {player.steps}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// --- Helper Wall Component (For Board) ---
const Wall = ({ data, color, isGhost }) => {
  const { x, y, orientation } = data;
  const isH = orientation === 'h';
  return (
    <div 
      className={`wall ${orientation} ${isGhost ? 'ghost' : ''}`}
      style={{
        // Precise pixel math based on Board's grid logic
        left: isH ? `calc(${x} * 62px)` : `calc(${x} * 62px + 48px)`,
        top: isH ? `calc(${y} * 62px + 48px)` : `calc(${y} * 62px)`,
        backgroundColor: color
      }}
    />
  );
};

// --- Board Component ---
const Board = () => {
  const { movePlayer, placeWall, players, walls, turn, gameState, validMoves } = useGameStore();
  const [hoverWall, setHoverWall] = useState(null);

  const cells = Array.from({ length: 81 }, (_, i) => ({ x: i % 9, y: Math.floor(i / 9) }));
  const intersections = Array.from({ length: 64 }, (_, i) => ({ x: i % 8, y: Math.floor(i / 8) }));

  const activePlayer = players[turn];
  const activeColor = activePlayer.color; 

  const handlePlace = (x, y, orientation) => {
    if (checkWallCollision(walls, { x, y, orientation })) return;
    placeWall({ x, y, orientation });
    setHoverWall(null);
  };

  return (
    <div className="game-board">
      
      {/* 1. CELLS */}
      {cells.map(c => {
        const isCurrentPos = activePlayer.x === c.x && activePlayer.y === c.y;
        const isValidMove = validMoves.some(m => m.x === c.x && m.y === c.y);

        return (
          <div 
            key={`c-${c.x}-${c.y}`} 
            className={`cell ${isValidMove ? 'valid-move' : ''} ${isCurrentPos ? 'current-pos' : ''}`} 
            onClick={() => isValidMove && movePlayer(c.x, c.y)} 
            style={{ '--highlight-color': activeColor }}
          >
            {isValidMove && <div className="glass-overlay" />}
          </div>
        );
      })}

      {/* 2. WALLS */}
      {walls.map((w, i) => (
        <Wall key={i} data={w} color={players[w.owner].color} />
      ))}

      {/* 3. TRIGGERS */}
      {gameState === 'playing' && intersections.map(i => {
         const isBlocked = walls.some(w => w.x === i.x && w.y === i.y);
         if (isBlocked) return null;

         return (
           <React.Fragment key={`int-${i.x}-${i.y}`}>
             <div className="trigger h"
               style={{ left: `calc(${i.x} * 62px)`, top: `calc(${i.y} * 62px + 50px)` }}
               onMouseEnter={() => setHoverWall({ x: i.x, y: i.y, orientation: 'h' })}
               onMouseLeave={() => setHoverWall(null)}
               onClick={() => handlePlace(i.x, i.y, 'h')}
             />
             <div className="trigger v"
               style={{ left: `calc(${i.x} * 62px + 50px)`, top: `calc(${i.y} * 62px)` }}
               onMouseEnter={() => setHoverWall({ x: i.x, y: i.y, orientation: 'v' })}
               onMouseLeave={() => setHoverWall(null)}
               onClick={() => handlePlace(i.x, i.y, 'v')}
             />
           </React.Fragment>
         );
      })}

      {/* 4. PREVIEW */}
      {hoverWall && !checkWallCollision(walls, hoverWall) && (
        <Wall data={hoverWall} color={activeColor} isGhost />
      )}

      {/* 5. PLAYERS */}
      {['p1', 'p2'].map(pid => (
        <motion.div 
          key={pid} className="player-token"
          animate={{ left: `calc(${players[pid].x} * 62px)`, top: `calc(${players[pid].y} * 62px)` }}
        >
          <div className="token-inner" style={{ background: players[pid].color }}>{players[pid].avatar}</div>
        </motion.div>
      ))}

    </div>
  );
};

// ==========================================
// 3. MAIN APP
// ==========================================

export default function App() {
  const { gameState, startGame, winner, players } = useGameStore();
  const isLobby = gameState === 'lobby';
  const winnerData = winner ? players[winner] : null;

  return (
    <div className="app-container">
      
      {/* Left Player */}
      <PlayerCard pid="p1" isLobby={isLobby} />

      {/* Center Stage */}
      <div className="center-stage">
        <h1 className="logo">QUORIDOR</h1>
        
        {/* Board Container */}
        <div style={{ position: 'relative' }}>
          
          <Board />

          {/* START OVERLAY (Lobby) */}
          <AnimatePresence>
            {isLobby && (
              <motion.div 
                className="start-overlay"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <div className="vs-badge" style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px'}}>VS</div>
                <button className="start-btn" onClick={startGame}>START GAME</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* WINNER OVERLAY (End Game) */}
          {gameState === 'winner' && winnerData && (
             <div className="start-overlay">
               <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
                 {winnerData.avatar}
               </div>
               <h2 style={{ fontSize: '2.5rem', color: 'white', margin: '0 0 10px 0' }}>
                 {winnerData.name} WINS!
               </h2>
               <div className="stat-badge" style={{ fontSize: '1.2rem', marginBottom: '30px', background: 'rgba(255,255,255,0.1)' }}>
                  Total Steps: {winnerData.steps} 👣
               </div>
               <button className="start-btn" onClick={startGame}>Play Again</button>
             </div>
          )}
        </div>
      </div>

      {/* Right Player */}
      <PlayerCard pid="p2" isLobby={isLobby} />

    </div>
  );
}