import React from 'react';
import { motion } from 'framer-motion';

export const Wall = ({ x, y, orientation }) => {
  const isH = orientation === 'h';

  return (
    <motion.div
      className="wall"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      style={{
        // Position logic:
        // Horizontal wall sits below row Y. Vertical sits right of col X.
        left: `calc(${x} * (var(--cell-size) + var(--gap)) - ${isH ? 0 : 'var(--gap)'})`,
        top: `calc(${y} * (var(--cell-size) + var(--gap)) + ${isH ? 'var(--cell-size)' : 0})`,
        
        // Size logic: Spans 2 cells + 1 gap
        width: isH ? `calc((var(--cell-size) * 2) + var(--gap))` : 'var(--gap)',
        height: isH ? 'var(--gap)' : `calc((var(--cell-size) * 2) + var(--gap))`,
      }}
    />
  );
};