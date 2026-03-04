import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store';

const AVATARS = ['🦁', '🐯', '🐼', '🦊', '👽', '🤖'];
const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export const PlayerCard = ({ pid, isLobby }) => {
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
      
      {/* EDITABLE NAME IN LOBBY */}
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