import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, checkWallCollision } from '../store';

export const Board = () => {
  const { movePlayer, placeWall, players, walls, turn, gameState, validMoves } = useGameStore();
  const [hoverWall, setHoverWall] = useState(null);

  const cells = Array.from({ length: 81 }, (_, i) => ({ x: i % 9, y: Math.floor(i / 9) }));
  const intersections = Array.from({ length: 64 }, (_, i) => ({ x: i % 8, y: Math.floor(i / 8) }));

  const activePlayer = players[turn];
  const activeColor = activePlayer.color; // Get current player color (Red/Blue)

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
            // PASS THE COLOR TO CSS VARIABLE
            style={{ '--highlight-color': activeColor }}
          >
            {/* The Glassy Overlay uses the variable above */}
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

const Wall = ({ data, color, isGhost }) => {
  const { x, y, orientation } = data;
  const isH = orientation === 'h';
  return (
    <div 
      className={`wall ${orientation} ${isGhost ? 'ghost' : ''}`}
      style={{
        left: isH ? `calc(${x} * 62px)` : `calc(${x} * 62px + 48px)`,
        top: isH ? `calc(${y} * 62px + 48px)` : `calc(${y} * 62px)`,
        backgroundColor: color
      }}
    />
  );
};