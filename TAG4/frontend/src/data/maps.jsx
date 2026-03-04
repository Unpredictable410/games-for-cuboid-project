export const MAPS_CONFIG = [
  {
    id: 1,
    name: "Sunny Hills",
    theme: "grass", // <--- NEW: Tells game to use Grass textures
    width: 2000,
    height: 1000,
    platforms: [
      { x: 0, y: 600, w: 800, h: 400 },
      { x: 900, y: 400, w: 200, h: 40 },
    ],
    // NEW: Jumping Pads
    springs: [
      { x: 600, y: 560 } // Sitting on the floor
    ],
    water: [{ x: 500, y: 900, w: 2000, h: 100 }],
    decorations: []
  },
  {
    id: 2,
    name: "Sand Dune Desert",
    theme: "desert", // <--- Switches to Sand textures
    width: 2000,
    height: 1000,
    platforms: [
      { x: 0, y: 500, w: 500, h: 500 },
      { x: 600, y: 400, w: 150, h: 40 },
      { x: 800, y: 300, w: 150, h: 40 },
    ],
    springs: [
      { x: 500, y: 460 },
      { x: 900, y: 260 }
    ],
    water: [], // No water in desert
    decorations: []
  },
  {
    id: 3,
    name: "Frozen Peaks",
    theme: "snow", 
    width: 2000,
    height: 1000,
    platforms: [
      { x: 0, y: 600, w: 400, h: 400 },
      { x: 500, y: 500, w: 200, h: 40 },
    ],
    springs: [],
    water: [{ x: 0, y: 900, w: 2000, h: 100 }], 
    decorations: []
  },
  {
    id: 4,
    name: "Dark Castle",
    theme: "castle", 
    width: 2000,
    height: 1000,
    platforms: [
      { x: 0, y: 600, w: 600, h: 400 },
      { x: 700, y: 500, w: 200, h: 40 },
    ],
    springs: [{ x: 500, y: 560 }],
    water: [], 
    decorations: []
  }
];