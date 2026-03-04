import React from 'react';

const GameOver = ({ results, onRestart }) => {
  const winner = results[0]; // First player in sorted list is winner
  
  return (
    <div className="menu-screen">
      <h1 style={{ color: winner.color }}>WINNER: {winner.name}</h1>
      <p>Time as "IT": {winner.tagTime.toFixed(2)}s</p>
      
      <div className="results-list">
        {results.slice(1).map((p, i) => (
          <div key={p.id} className="result-item">
            <span>{i + 2}. {p.name}</span>
            <span>{p.tagTime.toFixed(2)}s</span>
          </div>
        ))}
      </div>
      <button className="btn-primary" onClick={onRestart}>Play Again</button>
    </div>
  );
};

export default GameOver;