import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// CONSTANTS
const SOCKET_URL = 'http://localhost:3001';

// SOCKET CONNECTION
const socket = io(SOCKET_URL);

// GAME STATES (Local UI states)
const INPUT_NICKNAME = 'INPUT_NICKNAME';
const LOBBY_SELECTION = 'LOBBY_SELECTION';
const WAITING_ROOM = 'WAITING_ROOM';
const GAME_ACTIVE = 'GAME_ACTIVE';

const App = () => {
  // UI State
  const [uiState, setUiState] = useState(INPUT_NICKNAME);
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState({ type: '', msg: '' });
  const [translation, setTranslation] = useState('');
  const [targetLang, setTargetLang] = useState('hi');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [opponentInput, setOpponentInput] = useState('');

  // New: Loading State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  // Server State (synced)
  const [room, setRoom] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    // Socket Listeners
    socket.on('room_created', ({ roomCode }) => {
      setRoomCode(roomCode);
      setUiState(WAITING_ROOM);
    });

    socket.on('joined_success', ({ roomCode }) => {
      setRoomCode(roomCode);
      setUiState(WAITING_ROOM);
    });

    socket.on('update_room', (updatedRoom) => {
      setRoom(updatedRoom);
      if (updatedRoom.gameState === 'GUESSING') {
        setUiState(GAME_ACTIVE);
      }
    });

    socket.on('loading', ({ msg }) => {
      setIsLoading(true);
      setLoadingMsg(msg || 'Please wait...');
    });

    socket.on('game_started', (updatedRoom) => {
      setRoom(updatedRoom);
      setUiState(GAME_ACTIVE);
      setFeedback({ type: 'info', msg: 'Game Started!' });
      setIsLoading(false);
    });

    socket.on('guess_result', ({ success, skipped, msg, room }) => {
      setRoom(room);
      setIsLoading(false);

      const type = success ? 'success' : (skipped ? 'info' : 'error');
      setFeedback({ type, msg });

      if (success || skipped) {
        setInputValue('');
        setTranslation('');
        setOpponentInput('');
      } else {
        setTimeout(() => setInputValue(''), 1000);
      }
    });

    socket.on('challenge_set', ({ msg, room }) => {
      setRoom(room);
      setFeedback({ type: 'info', msg });
      setInputValue('');
      setTranslation('');
      setOpponentInput('');
      setIsLoading(false);
    });

    socket.on('player_typing', ({ text }) => {
      setOpponentInput(text);
    });

    socket.on('player_left', ({ msg }) => {
      setFeedback({ type: 'error', msg });
      setIsLoading(false);
    });

    socket.on('error', ({ msg }) => {
      setFeedback({ type: 'error', msg });
      setIsLoading(false);
    });

    return () => {
      socket.off('room_created');
      socket.off('joined_success');
      socket.off('update_room');
      socket.off('loading');
      socket.off('game_started');
      socket.off('guess_result');
      socket.off('challenge_set');
      socket.off('player_typing');
      socket.off('player_left');
      socket.off('error');
    };
  }, []);

  // -- ACTIONS --

  const handleNicknameSubmit = (e) => {
    e.preventDefault();
    if (nickname.trim()) setUiState(LOBBY_SELECTION);
  };

  const handleCreateRoom = () => {
    socket.emit('create_room', { nickname, maxPlayers });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      socket.emit('join_room', { nickname, roomCode: roomCode.toUpperCase() });
    }
  };

  const handleStartGame = (mode) => {
    socket.emit('start_game', { roomCode, mode });
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (room && room.gameState === 'GUESSING') {
      socket.emit('typing', { roomCode, text: val });
    }
  };

  const handleGameSubmit = (e) => {
    e.preventDefault();
    if (!inputValue) return;

    if (room.gameState === 'GUESSING') {
      socket.emit('submit_guess', { roomCode, guess: inputValue });
    }
  };

  const handleChallengeOptionClick = (word) => {
    socket.emit('submit_challenge', { roomCode, word });
  };

  // -- TRANSLATION --
  const fetchTranslation = async (word) => {
    if (!word) return;
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${word}&langpair=en|${targetLang}`);
      const data = await res.json();
      if (data.responseData) {
        setTranslation(data.responseData.translatedText);
      }
    } catch (e) {
      console.error("Translation failed", e);
    }
  };

  // -- RENDERERS --

  const renderLoadingOverlay = () => {
    if (!isLoading) return null;
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        color: 'white',
        textAlign: 'center'
      }} className="fade-in">
        <div className="spinner" style={{
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid #fff',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 300 }}>{loadingMsg}</h2>
        <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
      </div>
    );
  };

  const renderNicknameInput = () => (
    <div className="glass-panel center-text fade-in">
      <h1>Syno & Anto</h1>
      <p>Enter your nickname to start</p>
      <form onSubmit={handleNicknameSubmit}>
        <input
          type="text"
          className="glass-input"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Nickname"
          autoFocus
          maxLength={12}
        />
        <button type="submit" className="glass-btn" style={{ marginTop: '1rem' }} disabled={!nickname}>
          Continue
        </button>
      </form>
    </div>
  );

  const renderLobbySelection = () => (
    <div className="glass-panel center-text fade-in">
      <h1>Welcome, {nickname}!</h1>
      <div className="container" style={{ gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <h3>Create Room</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ marginRight: '1rem', color: '#cbd5e1' }}>Players:</label>
            <select
              className="lang-selector"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
              style={{ padding: '0.5rem' }}
            >
              <option value="2">2 Players</option>
              <option value="3">3 Players</option>
              <option value="4">4 Players</option>
            </select>
          </div>
          <button className="glass-btn" onClick={handleCreateRoom}>
            Create New Room
          </button>
        </div>
        <div className="vs-badge">OR</div>
        <div style={{ flex: 1 }}>
          <h3>Join Room</h3>
          <form onSubmit={handleJoinRoom}>
            <input
              type="text"
              className="glass-input"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              maxLength={4}
              style={{ textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase' }}
            />
            <button type="submit" className="glass-btn" style={{ marginTop: '1rem' }} disabled={!roomCode}>
              Join
            </button>
          </form>
        </div>
      </div>
      {feedback.msg && <p className="error-msg">{feedback.msg}</p>}
    </div>
  );

  const renderWaitingRoom = () => {
    if (!room) return <div>Loading...</div>;
    const isHost = room.host === socket.id;
    const isReady = room.players.length >= 2;

    return (
      <div className="glass-panel center-text fade-in">
        <h2>Room Code: <span style={{ color: 'var(--primary)', letterSpacing: '4px' }}>{room.code}</span></h2>
        <p>Share this code with your friends!</p>
        <div className="score-board" style={{ flexDirection: 'column', gap: '0.5rem', margin: '2rem 0' }}>
          {room.players.map((p, i) => (
            <div key={p.id} className="score-item" style={{ width: '100%', justifyContent: 'space-between' }}>
              <span>Player {i + 1}</span>
              <span style={{ fontWeight: 'bold' }}>{p.nickname} {p.id === room.host ? '(Host)' : ''}</span>
            </div>
          ))}
          {Array.from({ length: room.maxPlayers - room.players.length }).map((_, i) => (
            <div key={`empty-${i}`} className="score-item" style={{ width: '100%', justifyContent: 'space-between', opacity: 0.5 }}>
              <span>Empty Slot</span>
              <span>Waiting...</span>
            </div>
          ))}
        </div>
        {isHost ? (
          <div className="container">
            <button className="glass-btn" onClick={() => handleStartGame('syn')} disabled={!isReady}>
              Play Synonyms
            </button>
            <button className="glass-btn" onClick={() => handleStartGame('ant')} disabled={!isReady}>
              Play Antonyms
            </button>
          </div>
        ) : (
          <p>Waiting for host to start...</p>
        )}
        {!isReady && <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '1rem' }}>Need at least 2 players to start.</p>}
      </div>
    );
  };

  const renderGame = () => {
    if (!room) return null;

    const turnPlayer = room.players[room.turnIndex];
    const isMyTurn = turnPlayer.id === socket.id;
    const isGuessingPhase = room.gameState === 'GUESSING';
    const isChallengingPhase = room.gameState === 'CHALLENGING';

    const placeholder = isGuessingPhase
      ? `Enter ${room.gameMode === 'syn' ? 'synonym' : 'antonym'}...`
      : `Enter new challenge word...`;

    return (
      <div className="container fade-in" style={{ position: 'relative' }}>
        <div className="lang-controls">
          <select
            className="lang-selector"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          >
            <option value="hi">Hindi</option>
            <option value="gu">Gujarati</option>
          </select>
        </div>

        <div className="score-board" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          {room.players.map((p, i) => (
            <div key={p.id} className="score-item" style={{ minWidth: '100px' }}>
              <div className="score-label">{p.nickname}</div>
              <div className={`score-value ${room.turnIndex === i ? 'active-turn' : ''}`}>{p.score}</div>
            </div>
          ))}
        </div>

        <div className={`glass-panel center-text`}>
          {/* PROGRESS BAR or ATTEMPT COUNTER */}
          {isGuessingPhase && room.incorrectGuesses > 0 && (
            <div style={{ color: 'var(--error)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Attempt {room.incorrectGuesses}/3
            </div>
          )}

          <div className="label">
            {isGuessingPhase
              ? `${turnPlayer.nickname}'s Turn to Guess`
              : `${turnPlayer.nickname} is Choosing Challenge`}
          </div>

          {isGuessingPhase && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{room.currentWord}</h1>
                <button
                  className="translate-btn"
                  onClick={() => fetchTranslation(room.currentWord)}
                >
                  🌐
                </button>
              </div>
              {translation && <div className="translation-tag fade-in">{translation}</div>}
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', marginTop: '1rem' }}>
                Find a <strong>{room.gameMode === 'syn' ? 'Synonym' : 'Antonym'}</strong>
              </p>
            </div>
          )}

          {!isGuessingPhase && (
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Pick Next Word</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Select the next word to challenge players!
              </p>
            </div>
          )}

          {/* ACTION AREA */}
          {isMyTurn ? (
            <>
              {isGuessingPhase ? (
                <form onSubmit={handleGameSubmit}>
                  <input
                    ref={inputRef}
                    type="text"
                    className="glass-input"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    autoFocus
                  />
                  <div style={{ marginTop: '1.5rem' }}>
                    <button type="submit" className="glass-btn" disabled={!inputValue}>
                      Submit Guess
                    </button>
                  </div>
                </form>
              ) : (
                // CHALLENGER CHOICE UI
                <div className="container" style={{ gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {room.challengeOptions && room.challengeOptions.map((word, idx) => (
                    <button
                      key={idx}
                      className="glass-btn"
                      onClick={() => handleChallengeOptionClick(word)}
                      style={{ minWidth: '150px' }}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="waiting-pulse" style={{ padding: '2rem' }}>
              <p style={{ marginBottom: '1rem' }}>Waiting for {turnPlayer.nickname}...</p>
              {isGuessingPhase && (
                <div className="glass-input" style={{ opacity: 0.7, fontStyle: 'italic' }}>
                  {opponentInput || "..."}
                </div>
              )}
            </div>
          )}

          {feedback.msg && (
            <div style={{
              marginTop: '1rem',
              color: feedback.type === 'error' ? 'var(--error)' : (feedback.type === 'success' ? 'var(--success)' : '#334155'),
              fontWeight: 600
            }}>
              {feedback.msg}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderLoadingOverlay()}
      {uiState === INPUT_NICKNAME && renderNicknameInput()}
      {uiState === LOBBY_SELECTION && renderLobbySelection()}
      {uiState === WAITING_ROOM && renderWaitingRoom()}
      {uiState === GAME_ACTIVE && renderGame()}
    </>
  );
};

export default App;
