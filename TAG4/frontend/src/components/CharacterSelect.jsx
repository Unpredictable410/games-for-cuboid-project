import React from 'react';
import { PLAYERS_CONFIG } from '../data/players';

const CharacterSelect = ({ onNext }) => (
  <div className="menu-screen">
    <h2>Controls Setup</h2>
    <div className="card-grid">
      {PLAYERS_CONFIG.map(p => (
        <div key={p.id} className="player-card" style={{ borderColor: p.color }}>
          <h3 style={{ color: p.color }}>{p.name}</h3>
          <div className="controls">
            <span>⬆ {p.keys.up}</span>
            <span>⬅ {p.keys.left} ⬇ {p.keys.down} ➡ {p.keys.right}</span>
          </div>
        </div>
      ))}
    </div>
    <button className="btn-primary" onClick={onNext}>Confirm & Select Map</button>
  </div>
);

export default CharacterSelect;