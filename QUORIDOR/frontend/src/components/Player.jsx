import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store';

export const Player = ({ id }) => {
  const { x, y, color } = useGameStore(state => state.players[id]);

  // CSS Grid math: Each cell is ~50px + 4px gap (defined in CSS)
  // We calculate position as percentage (x * 100% / 9) roughly, 
  // but using 'calc' in styling is easier. 
  // For simplicity here, we assume exact grid steps.
  
  return (
    <motion.div
      className="player-token"
      initial={false}
      animate={{
        left: `calc(${x} * (var(--cell-size) + var(--gap)))`,
        top: `calc(${y} * (var(--cell-size) + var(--gap)))`,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ backgroundColor: color }}
    >
      <div className="player-inner" />
    </motion.div>
  );
};