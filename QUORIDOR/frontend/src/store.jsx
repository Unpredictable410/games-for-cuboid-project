import { create } from 'zustand';

// --- HELPERS ---

// 1. Check if a wall overlaps another wall
const checkWallCollision = (walls, newWall) => {
  return walls.some(w => {
    if (w.x === newWall.x && w.y === newWall.y) return true;
    if (w.orientation === newWall.orientation) {
       if (w.orientation === 'h' && w.y === newWall.y && Math.abs(w.x - newWall.x) < 2) return true;
       if (w.orientation === 'v' && w.x === newWall.x && Math.abs(w.y - newWall.y) < 2) return true;
    }
    return false;
  });
};

// 2. Check if a single ORTHOGONAL step is blocked
const isStepBlocked = (x1, y1, x2, y2, walls) => {
  if (y1 === y2) { // Horizontal Move
    const wallX = Math.min(x1, x2); 
    const wallY = y1;
    return walls.some(w => w.orientation === 'v' && w.x === wallX && (w.y === wallY || w.y === wallY - 1));
  }
  if (x1 === x2) { // Vertical Move
    const wallX = x1;
    const wallY = Math.min(y1, y2);
    return walls.some(w => w.orientation === 'h' && w.y === wallY && (w.x === wallX || w.x === wallX - 1));
  }
  return true;
};

// 3. BFS Pathfinding (Anti-Lock)
const hasPathToGoal = (startX, startY, goalRow, walls) => {
  const queue = [{x: startX, y: startY}];
  const visited = new Set([`${startX},${startY}`]);
  // Pathfinding only checks orthogonal moves (valid basic movement)
  const directions = [{dx:0, dy:1}, {dx:0, dy:-1}, {dx:1, dy:0}, {dx:-1, dy:0}];

  while(queue.length > 0) {
    const curr = queue.shift();
    if (curr.y === goalRow) return true;

    for (const d of directions) {
      const nx = curr.x + d.dx;
      const ny = curr.y + d.dy;
      
      if (nx >= 0 && nx <= 8 && ny >= 0 && ny <= 8) {
        if (!isStepBlocked(curr.x, curr.y, nx, ny, walls)) {
          const key = `${nx},${ny}`;
          if (!visited.has(key)) {
            visited.add(key);
            queue.push({x: nx, y: ny});
          }
        }
      }
    }
  }
  return false;
};

// 4. CALCULATE VALID MOVES (STRICT QUORIDOR LOGIC)
const calculateValidMoves = (player, opponent, walls) => {
  const moves = [];
  // ONLY 4 Directions allowed initially
  const directions = [{dx:0, dy:1}, {dx:0, dy:-1}, {dx:1, dy:0}, {dx:-1, dy:0}];

  directions.forEach(dir => {
    const nx = player.x + dir.dx;
    const ny = player.y + dir.dy;

    // A. Bounds Check
    if (nx >= 0 && nx <= 8 && ny >= 0 && ny <= 8) {
      
      // B. Wall Check (Immediate Step)
      if (!isStepBlocked(player.x, player.y, nx, ny, walls)) {
        
        // C. Opponent Handling (Jump Logic)
        if (nx === opponent.x && ny === opponent.y) {
          // Face-to-Face! Try Straight Jump first.
          const jumpX = nx + dir.dx;
          const jumpY = ny + dir.dy;
          
          // Check if straight jump is valid (in bounds + no wall blocking jump)
          const canStraightJump = 
            jumpX >= 0 && jumpX <= 8 && jumpY >= 0 && jumpY <= 8 && 
            !isStepBlocked(nx, ny, jumpX, jumpY, walls);

          if (canStraightJump) {
            moves.push({ x: jumpX, y: jumpY });
          } else {
            // Straight jump blocked? Try Diagonals.
            // Diagonals are perpendicular to current direction.
            const diags = dir.dx === 0 
              ? [{dx:1, dy:0}, {dx:-1, dy:0}] // If moving Vertically, look Left/Right
              : [{dx:0, dy:1}, {dx:0, dy:-1}]; // If moving Horiz, look Up/Down

            diags.forEach(diag => {
              const diagX = nx + diag.dx;
              const diagY = ny + diag.dy;
              
              if (diagX >= 0 && diagX <= 8 && diagY >= 0 && diagY <= 8) {
                 // Must not be blocked by wall between Opponent and Diagonal square
                 if (!isStepBlocked(nx, ny, diagX, diagY, walls)) {
                   moves.push({ x: diagX, y: diagY });
                 }
              }
            });
          }
        } else {
          // Empty Square -> Valid Move
          moves.push({ x: nx, y: ny });
        }
      }
    }
  });
  return moves;
};

// --- STORE ---
export const useGameStore = create((set, get) => ({
  gameState: 'lobby',
  turn: 'p1',
  winner: null,
  validMoves: [],
  
  players: {
    p1: { x: 4, y: 0, color: '#ef4444', name: 'Player 1', walls: 10, steps: 0, avatar: '🦁' },
    p2: { x: 4, y: 8, color: '#3b82f6', name: 'Player 2', walls: 10, steps: 0, avatar: '🐯' },
  },

  walls: [],

  setPlayerInfo: (pid, key, value) => set((state) => ({
    players: { ...state.players, [pid]: { ...state.players[pid], [key]: value } }
  })),

  // START GAME
  startGame: () => {
    const state = get();
    // Calculate P1 moves with strict logic
    const initialMoves = calculateValidMoves(
      { x:4, y:0 }, 
      { x:4, y:8 }, 
      []
    );
    
    set({ 
      gameState: 'playing', 
      walls: [], 
      turn: 'p1', 
      winner: null,
      validMoves: initialMoves,
      players: {
        p1: { ...state.players.p1, x: 4, y: 0, walls: 10, steps: 0 },
        p2: { ...state.players.p2, x: 4, y: 8, walls: 10, steps: 0 }
      }
    });
  },

  // MOVE PLAYER
  movePlayer: (x, y) => {
    const { gameState, turn, players, walls, validMoves } = get();
    if (gameState !== 'playing') return;

    // Validate Move
    const isValid = validMoves.some(m => m.x === x && m.y === y);
    if (!isValid) return;

    const current = players[turn];
    const nextTurn = turn === 'p1' ? 'p2' : 'p1';
    
    const nextPlayers = { 
      ...players, 
      [turn]: { ...current, x, y, steps: current.steps + 1 } 
    };

    // WINNER: Save ID ('p1' or 'p2') so we can look up their name/stats
    if (turn === 'p1' && y === 8) return set({ gameState: 'winner', winner: 'p1', players: nextPlayers });
    if (turn === 'p2' && y === 0) return set({ gameState: 'winner', winner: 'p2', players: nextPlayers });

    // Calculate moves for NEXT player using Strict Logic
    const nextMoves = calculateValidMoves(nextPlayers[nextTurn], nextPlayers[turn], walls);

    set({ players: nextPlayers, turn: nextTurn, validMoves: nextMoves });
  },

  // PLACE WALL
  placeWall: (wall) => {
    const { gameState, turn, players, walls } = get();
    if (gameState !== 'playing' || players[turn].walls <= 0) return;

    if (checkWallCollision(walls, wall)) return;

    // Anti-Lock Check
    const testWalls = [...walls, { ...wall, owner: turn }];
    const p1CanReach = hasPathToGoal(players.p1.x, players.p1.y, 8, testWalls);
    const p2CanReach = hasPathToGoal(players.p2.x, players.p2.y, 0, testWalls);

    if (!p1CanReach || !p2CanReach) {
      console.warn("Placement blocked: Path Blocked");
      return; 
    }

    const nextTurn = turn === 'p1' ? 'p2' : 'p1';
    
    // Recalculate moves for NEXT player using Strict Logic
    const nextMoves = calculateValidMoves(players[nextTurn], players[turn], testWalls);

    set((state) => ({
      walls: testWalls,
      players: { ...state.players, [turn]: { ...state.players[turn], walls: state.players[turn].walls - 1 } },
      turn: nextTurn,
      validMoves: nextMoves
    }));
  }
}));

export { checkWallCollision };