import React from 'react';

const StartScreen = ({ onStart }) => (
  <div className="menu-screen">
    <h1 className="game-title">TAG 4</h1>
    <p>4 Players. 1 Keyboard. Don't be IT.</p>
    <button className="btn-primary" onClick={onStart}>START GAME</button>
  </div>
);

export default StartScreen;