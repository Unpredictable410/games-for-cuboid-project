import React, { useState } from 'react';
import './App.css';
import StartScreen from './components/StartScreen';
import CharacterSelect from './components/CharacterSelect';
import MapSelect from './components/MapSelect';
import GameCanvas from './components/GameCanvas';
import GameOver from './components/GameOver';

function App() {
  const [screen, setScreen] = useState('start'); 
  const [selectedMap, setSelectedMap] = useState(null);
  const [results, setResults] = useState([]);

  // Transition Helpers
  const goCharSelect = () => setScreen('charSelect');
  const goMapSelect = () => setScreen('mapSelect');
  const startGame = (map) => {
    setSelectedMap(map);
    setScreen('game');
  };
  
  const endGame = (finalPlayerData) => {
    // Sort logic: Smallest 'tagTime' is the winner
    const sorted = [...finalPlayerData].sort((a, b) => a.tagTime - b.tagTime);
    setResults(sorted);
    setScreen('gameOver');
  };

  const restart = () => setScreen('start');

  return (
    <div className="App">
      {screen === 'start' && <StartScreen onStart={goCharSelect} />}
      {screen === 'charSelect' && <CharacterSelect onNext={goMapSelect} />}
      {screen === 'mapSelect' && <MapSelect onSelectMap={startGame} />}
      {screen === 'game' && <GameCanvas selectedMap={selectedMap} onGameOver={endGame} />}
      {screen === 'gameOver' && <GameOver results={results} onRestart={restart} />}
    </div>
  );
}

export default App;