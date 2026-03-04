import React from 'react';
import { useGameStore } from './store';
import { PlayerCard } from './components/PlayerCard';
import { Board } from './components/Board';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
  const { gameState, startGame, winner, players } = useGameStore();
  const isLobby = gameState === 'lobby';

  // Helper to get winner data safely
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
                <div className="vs-badge">VS</div>
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