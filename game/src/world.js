// Shadow Vault — simulation: player, patrolling guards, vision cones,
// line of sight, detection, distraction coins, objectives and escape.
import {
  WALLS, CRATES, HEDGES, VAULT_DOOR, KEY_POS, RELIC_POS, EXIT, START,
  GUARDS, VIEW_RANGE, VIEW_HALF, CLOSE_RANGE,
} from './config.js';

const solids = (hasKey) => {
  const list = [...WALLS, ...CRATES];
  if (!hasKey) list.push(VAULT_DOOR);
  return list;
};

function rectHit(x, y, r, rect) {
  const nx = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  return (x - nx) ** 2 + (y - ny) ** 2 < r * r;
}

function moveCircle(p, dx, dy, r, hasKey) {
  const list = solids(hasKey);
  p.x += dx;
  for (const s of list) if (rectHit(p.x, p.y, r, s)) p.x -= dx;
  p.y += dy;
  for (const s of list) if (rectHit(p.x, p.y, r, s)) p.y -= dy;
  p.x = Math.max(r, Math.min(960 - r, p.x));
  p.y = Math.max(r, Math.min(640 - r, p.y));
}

// Is the straight line a->b blocked by a wall or crate? Stepped ray:
// cheap, robust at this scale, and identical every run.
export function lineBlocked(ax, ay, bx, by, hasKey) {
  const dist = Math.hypot(bx - ax, by - ay);
  const steps = Math.max(1, Math.ceil(dist / 7));
  const list = solids(hasKey);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = ax + (bx - ax) * t, y = ay + (by - ay) * t;
    for (const s of list) {
      if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return true;
    }
  }
  return false;
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

export function createWorld() {
  const state = {
    screen: 'title', // title | play | caught | won
    time: 0, elapsed: 0, spotted: 0, coins: 3,
    message: '', messageT: 0,
    player: { x: START.x, y: START.y, r: 11, face: -Math.PI / 2, moving: false, sneak: false },
    hasKey: false, hasRelic: false,
    detection: 0, seenBy: null,
    coinFx: null, // {x, y, t} a tossed coin guards may investigate
    guards: GUARDS.map((g) => ({
      x: g.path[0][0], y: g.path[0][1], path: g.path, speed: g.speed,
      pause: g.pause, wp: 1, wait: 0, angle: Math.atan2(g.path[1][1] - g.path[0][1], g.path[1][0] - g.path[0][0]),
      mode: 'patrol', // patrol | investigate | return
      tx: 0, ty: 0, alert: 0,
    })),
  };

  function inHedge(p) {
    return HEDGES.some((h) => p.x >= h.x && p.x <= h.x + h.w && p.y >= h.y && p.y <= h.y + h.h);
  }

  function guardSees(g) {
    const p = state.player;
    const dx = p.x - g.x, dy = p.y - g.y;
    const dist = Math.hypot(dx, dy);
    if (dist < CLOSE_RANGE) return lineBlocked(g.x, g.y, p.x, p.y, state.hasKey) ? 0 : 1;
    if (dist > VIEW_RANGE) return 0;
    const ang = Math.atan2(dy, dx);
    if (Math.abs(angleDiff(ang, g.angle)) > VIEW_HALF) return 0;
    if (lineBlocked(g.x, g.y, p.x, p.y, state.hasKey)) return 0;
    if (inHedge(p) && !p.moving) return 0; // held still in a hedge: invisible
    // Strength falls with distance; sneaking and hedge cover soften it.
    let s = 1.15 - dist / VIEW_RANGE;
    if (p.sneak) s *= 0.45;
    if (inHedge(p)) s *= 0.4;
    if (!p.moving) s *= 0.7;
    return Math.max(0, s);
  }

  function stepGuard(g, dt) {
    if (g.wait > 0) {
      g.wait -= dt;
      g.angle += Math.sin(state.time * 1.7 + g.x) * dt * 0.7; // look around
      return;
    }
    let tx, ty, speed = g.speed;
    if (g.mode === 'investigate') { tx = g.tx; ty = g.ty; speed = g.speed * 1.35; }
    else { const w = g.path[g.wp]; tx = w[0]; ty = w[1]; }
    const dx = tx - g.x, dy = ty - g.y, dist = Math.hypot(dx, dy);
    if (dist < 4) {
      if (g.mode === 'investigate') { g.mode = 'patrol'; g.wait = 1.6; }
      else { g.wp = (g.wp + 1) % g.path.length; g.wait = g.pause * 0.5; }
      return;
    }
    const want = Math.atan2(dy, dx);
    g.angle += Math.max(-3.2 * dt, Math.min(3.2 * dt, angleDiff(want, g.angle)));
    const vx = Math.cos(g.angle) * speed * dt, vy = Math.sin(g.angle) * speed * dt;
    const probe = { x: g.x, y: g.y };
    moveCircle(probe, vx, vy, 11, true);
    g.x = probe.x; g.y = probe.y;
  }

  function step(dt, ctrl) {
    state.time += dt;
    if (state.screen !== 'play') return;
    state.elapsed += dt;
    if (state.messageT > 0) state.messageT -= dt;

    // --- player ---
    const p = state.player;
    p.sneak = !!ctrl.sneak;
    p.moving = !!(ctrl.x || ctrl.y);
    if (p.moving) {
      const len = Math.hypot(ctrl.x, ctrl.y) || 1;
      const speed = p.sneak ? 62 : 118;
      p.face = Math.atan2(ctrl.y, ctrl.x);
      moveCircle(p, (ctrl.x / len) * speed * dt, (ctrl.y / len) * speed * dt, p.r, state.hasKey);
    }

    // --- coin toss (distraction) ---
    if (ctrl.coin && state.coins > 0) {
      const dx = ctrl.coin.x - p.x, dy = ctrl.coin.y - p.y;
      const d = Math.hypot(dx, dy) || 1, reach = Math.min(d, 230);
      const cx = p.x + (dx / d) * reach, cy = p.y + (dy / d) * reach;
      state.coinFx = { x: cx, y: cy, t: 0.5 };
      state.coins -= 1;
      let best = null, bd = 190;
      for (const g of state.guards) {
        const gd = Math.hypot(g.x - cx, g.y - cy);
        if (gd < bd) { bd = gd; best = g; }
      }
      if (best) { best.mode = 'investigate'; best.tx = cx; best.ty = cy; best.wait = 0; }
      state.message = best ? 'A coin glints — a guard turns to look.' : 'The coin lands. Nobody hears it.';
      state.messageT = 2.6;
    }
    if (state.coinFx) { state.coinFx.t -= dt; if (state.coinFx.t <= 0) state.coinFx = null; }

    // --- pickups and exit ---
    if (!state.hasKey && Math.hypot(p.x - KEY_POS.x, p.y - KEY_POS.y) < 22) {
      state.hasKey = true;
      state.message = 'Brass key taken. The vault door will open now.';
      state.messageT = 3;
    }
    if (state.hasKey && !state.hasRelic && Math.hypot(p.x - RELIC_POS.x, p.y - RELIC_POS.y) < 24) {
      state.hasRelic = true;
      state.message = 'The Moonlight Relic is yours. Reach the garden gate — unseen.';
      state.messageT = 3.4;
    }
    if (state.hasRelic && p.x >= EXIT.x && p.x <= EXIT.x + EXIT.w && p.y >= EXIT.y) {
      state.screen = 'won';
      return;
    }

    // --- guards and detection ---
    let strongest = 0, seer = null;
    for (const g of state.guards) {
      stepGuard(g, dt);
      const s = guardSees(g);
      g.alert = s;
      if (s > strongest) { strongest = s; seer = g; }
    }
    if (strongest > 0) {
      if (state.detection === 0) state.spotted += 1;
      state.detection += strongest * dt * 95;
      state.seenBy = seer;
    } else {
      state.detection -= dt * 42;
      if (state.detection <= 0) state.seenBy = null;
    }
    state.detection = Math.max(0, Math.min(100, state.detection));
    if (state.detection >= 100) state.screen = 'caught';
  }

  function score() {
    const t = Math.round(state.elapsed);
    const base = 1000 + Math.max(0, 600 - t * 4) + state.coins * 60;
    return Math.max(100, base - state.spotted * 90);
  }

  return { state, step, score, inHedge };
}
