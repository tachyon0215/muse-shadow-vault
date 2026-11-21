// Shadow Vault — level data and tuning constants.
// Original top-down stealth: one hand-built vault floor, patrolling
// Lantern Watch guards, crates and hedges for cover, a locked vault,
// a relic to steal and a garden gate to escape through.

export const W = 960;
export const H = 640;
export const STEP = 1 / 120;

export const VIEW_RANGE = 158;
export const VIEW_HALF = 0.62; // radians, half-angle of a guard's cone
export const CLOSE_RANGE = 46; // a guard notices you at arm's length, bush or not

// Walls block movement and sight. x, y, w, h in world pixels.
export const WALLS = [
  // outer shell (with a gap at the garden gate, bottom right)
  { x: 0, y: 0, w: 960, h: 16 }, { x: 0, y: 624, w: 800, h: 16 },
  { x: 880, y: 624, w: 80, h: 16 },
  { x: 0, y: 0, w: 16, h: 640 }, { x: 944, y: 0, w: 16, h: 640 },
  // west store room (holds the brass key)
  { x: 16, y: 200, w: 210, h: 14 }, { x: 300, y: 200, w: 90, h: 14 },
  { x: 226, y: 16, w: 14, h: 90 }, { x: 226, y: 150, w: 14, h: 64 },
  // central hall partitions
  { x: 470, y: 16, w: 14, h: 190 }, { x: 470, y: 260, w: 14, h: 120 },
  { x: 240, y: 420, w: 230, h: 14 }, { x: 540, y: 420, w: 120, h: 14 },
  // vault block, top right; its door is separate (locked until the key)
  { x: 640, y: 16, w: 14, h: 130 }, { x: 730, y: 16, w: 14, h: 130 },
  { x: 640, y: 146, w: 220, h: 14 }, { x: 820, y: 146, w: 124, h: 14 },
  // south gallery pillars and stubs
  { x: 700, y: 420, w: 14, h: 130 }, { x: 700, y: 590, w: 14, h: 34 },
  { x: 120, y: 500, w: 120, h: 14 },
];

// Crates: solid cover that blocks sight and movement, lower than walls.
export const CRATES = [
  { x: 268, y: 84, w: 44, h: 44 }, { x: 316, y: 84, w: 44, h: 44 },
  { x: 540, y: 300, w: 44, h: 44 }, { x: 120, y: 300, w: 44, h: 44 },
  { x: 560, y: 500, w: 44, h: 44 }, { x: 820, y: 300, w: 44, h: 44 },
  { x: 380, y: 520, w: 44, h: 44 },
];

// Hedges: walk-through cover. Standing in one hides you from cones
// beyond CLOSE_RANGE.
export const HEDGES = [
  { x: 400, y: 90, w: 52, h: 52 }, { x: 520, y: 120, w: 52, h: 40 },
  { x: 260, y: 300, w: 64, h: 40 }, { x: 760, y: 480, w: 64, h: 44 },
  { x: 60, y: 420, w: 52, h: 44 }, { x: 880, y: 200, w: 48, h: 60 },
];

export const VAULT_DOOR = { x: 654, y: 146, w: 76, h: 14 };
export const KEY_POS = { x: 80, y: 110 };
export const RELIC_POS = { x: 692, y: 70 };
export const EXIT = { x: 800, y: 600, w: 80, h: 40 };
export const START = { x: 70, y: 570 };

// Guard patrols: waypoint loops, walked in order. pause = seconds
// spent looking around at the last waypoint of each visit.
export const GUARDS = [
  { path: [[420, 60], [600, 60], [600, 170], [420, 170]], speed: 52, pause: 1.2 },
  { path: [[300, 260], [620, 260], [620, 380], [300, 380]], speed: 58, pause: 0.8 },
  { path: [[860, 560], [760, 560], [760, 440], [880, 440]], speed: 55, pause: 1.0 },
  { path: [[90, 250], [90, 130], [170, 130]], speed: 46, pause: 1.4 },
  { path: [[500, 580], [240, 580], [240, 470], [500, 470]], speed: 60, pause: 0.6 },
];
