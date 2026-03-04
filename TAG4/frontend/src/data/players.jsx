export const PLAYERS_CONFIG = [
  {
    id: 1,
    name: "Red (WASD)",
    color: "#ff0055",
    keys: { up: "w", left: "a", down: "s", right: "d" },
    startPos: { x: 100, y: 100 } // High up (y=100)
  },
  {
    id: 2,
    name: "Blue (IJKL)",
    color: "#00ccff",
    keys: { up: "i", left: "j", down: "k", right: "l" },
    startPos: { x: 200, y: 100 }
  },
  {
    id: 3,
    name: "Green (Arrows)",
    color: "#00ff66",
    keys: { up: "ArrowUp", left: "ArrowLeft", down: "ArrowDown", right: "ArrowRight" },
    startPos: { x: 600, y: 100 }
  },
  {
    id: 4,
    name: "Purple (Numpad)",
    color: "#cc00ff",
    keys: { up: "8", left: "4", down: "2", right: "6" },
    startPos: { x: 700, y: 100 }
  }
];