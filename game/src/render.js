// Shadow Vault — canvas rendering: floor, cover, vision cones, actors, HUD.
import { WALLS, CRATES, HEDGES, VAULT_DOOR, KEY_POS, RELIC_POS, EXIT, VIEW_RANGE, VIEW_HALF } from './config.js';
import { lineBlocked } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

function conePath(ctx, g, hasKey) {
  // Build the visible cone as a fan of rays stopped by walls/crates.
  const steps = 26;
  ctx.beginPath();
  ctx.moveTo(g.x, g.y);
  for (let i = 0; i <= steps; i++) {
    const a = g.angle - VIEW_HALF + (2 * VIEW_HALF * i) / steps;
    let r = VIEW_RANGE;
    // shorten this ray where a blocker cuts it
    for (let d = 14; d < VIEW_RANGE; d += 14) {
      const x = g.x + Math.cos(a) * d, y = g.y + Math.sin(a) * d;
      if (lineBlocked(g.x, g.y, x, y, hasKey)) { r = d; break; }
    }
    ctx.lineTo(g.x + Math.cos(a) * r, g.y + Math.sin(a) * r);
  }
  ctx.closePath();
}

function drawWorld(ctx, world) {
  const s = world.state;
  // floor
  ctx.fillStyle = '#1a2030'; ctx.fillRect(0, 0, 960, 640);
  ctx.strokeStyle = 'rgba(255,255,255,0.045)'; ctx.lineWidth = 1;
  for (let x = 0; x <= 960; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 640); ctx.stroke(); }
  for (let y = 0; y <= 640; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(960, y); ctx.stroke(); }
  // exit gate
  ctx.fillStyle = s.hasRelic ? '#2f9e63' : '#37503f';
  ctx.fillRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.fillStyle = '#dff7e8'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
  ctx.fillText('GARDEN GATE', EXIT.x + EXIT.w / 2, EXIT.y + 24);
  // hedges (under actors)
  for (const h of HEDGES) {
    ctx.fillStyle = '#24402a'; ctx.fillRect(h.x, h.y, h.w, h.h);
    ctx.fillStyle = '#2f5a36';
    for (let i = 0; i < 7; i++) {
      const cx = h.x + 8 + ((i * 37) % Math.max(8, h.w - 14));
      const cy = h.y + 8 + ((i * 23) % Math.max(8, h.h - 14));
      ctx.beginPath(); ctx.arc(cx, cy, 7, 0, 7); ctx.fill();
    }
  }
  // vision cones (under walls so cones stop visually at cover)
  for (const g of s.guards) {
    const hot = g.alert > 0.05;
    ctx.fillStyle = hot ? 'rgba(255,84,60,0.30)' : 'rgba(255,214,110,0.20)';
    conePath(ctx, g, s.hasKey);
    ctx.fill();
  }
  // crates
  for (const c of CRATES) {
    ctx.fillStyle = '#8a6a3c'; ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = '#5d4525'; ctx.lineWidth = 3; ctx.strokeRect(c.x + 2, c.y + 2, c.w - 4, c.h - 4);
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x + c.w, c.y + c.h);
    ctx.moveTo(c.x + c.w, c.y); ctx.lineTo(c.x, c.y + c.h); ctx.stroke();
  }
  // walls
  for (const w of WALLS) { ctx.fillStyle = '#3d465e'; ctx.fillRect(w.x, w.y, w.w, w.h); }
  ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(0, 0, 960, 3);
  // vault door
  ctx.fillStyle = s.hasKey ? '#274b35' : '#7a2f2b';
  ctx.fillRect(VAULT_DOOR.x, VAULT_DOOR.y, VAULT_DOOR.w, VAULT_DOOR.h);
  ctx.fillStyle = '#f2e6c9'; ctx.font = 'bold 10px system-ui';
  ctx.fillText(s.hasKey ? 'VAULT — OPEN' : 'VAULT — LOCKED', VAULT_DOOR.x + VAULT_DOOR.w / 2, VAULT_DOOR.y + 11);
  // pickups
  if (!s.hasKey) {
    ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(KEY_POS.x, KEY_POS.y, 8, 0, 7); ctx.fill();
    ctx.fillRect(KEY_POS.x + 6, KEY_POS.y - 2, 12, 4);
    ctx.fillStyle = '#14100a'; ctx.font = 'bold 9px system-ui'; ctx.fillText('KEY', KEY_POS.x, KEY_POS.y + 3);
  }
  if (!s.hasRelic) {
    const pulse = 3 + Math.sin(s.time * 3) * 1.5;
    ctx.fillStyle = '#bfe8ff'; ctx.beginPath();
    ctx.moveTo(RELIC_POS.x, RELIC_POS.y - 10 - pulse * 0.3);
    ctx.lineTo(RELIC_POS.x + 9, RELIC_POS.y); ctx.lineTo(RELIC_POS.x, RELIC_POS.y + 10 + pulse * 0.3);
    ctx.lineTo(RELIC_POS.x - 9, RELIC_POS.y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#0e2a3a'; ctx.font = 'bold 8px system-ui'; ctx.fillText('RELIC', RELIC_POS.x, RELIC_POS.y + 3);
  }
  // coin distraction marker
  if (s.coinFx) {
    ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(s.coinFx.x, s.coinFx.y, 6, 0, 7); ctx.fill();
    ctx.strokeStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(s.coinFx.x, s.coinFx.y, 10 + (0.5 - s.coinFx.t) * 16, 0, 7); ctx.stroke();
  }
  // guards: Lantern Watch — amber coats, lantern glow dot ahead
  for (const g of s.guards) {
    ctx.fillStyle = 'rgba(255,190,80,0.16)'; ctx.beginPath(); ctx.arc(g.x, g.y, 20, 0, 7); ctx.fill();
    ctx.fillStyle = g.mode === 'investigate' ? '#e08a2e' : '#c96a1e';
    ctx.beginPath(); ctx.arc(g.x, g.y, 11, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffe9b0';
    ctx.beginPath(); ctx.arc(g.x + Math.cos(g.angle) * 7, g.y + Math.sin(g.angle) * 7, 3.4, 0, 7); ctx.fill();
    if (g.alert > 0.05) {
      ctx.fillStyle = '#ffdf6b'; ctx.font = 'bold 16px system-ui';
      ctx.fillText(g.alert > 0.55 ? '!' : '?', g.x, g.y - 18);
    }
  }
  // player: a quiet figure in deep teal; ring shows when hidden in a hedge
  const p = s.player;
  const hidden = world.inHedge(p);
  ctx.fillStyle = hidden ? 'rgba(46,204,190,0.55)' : '#2eccbe';
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
  ctx.fillStyle = '#08302c'; ctx.beginPath();
  ctx.arc(p.x + Math.cos(p.face) * 5, p.y + Math.sin(p.face) * 5, 3.2, 0, 7); ctx.fill();
  if (hidden) { ctx.strokeStyle = '#7dffd4'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 4, 0, 7); ctx.stroke(); }
}

function drawHud(ctx, world) {
  const s = world.state;
  ctx.fillStyle = 'rgba(8,10,16,0.78)'; ctx.fillRect(0, 0, 960, 34);
  ctx.fillStyle = '#e8edf5'; ctx.font = '13px system-ui'; ctx.textAlign = 'left';
  const goal = !s.hasKey ? 'Steal the brass key (west store room)'
    : !s.hasRelic ? 'Open the vault and take the Moonlight Relic'
    : 'Escape through the garden gate — unseen';
  ctx.fillText(goal, 12, 22);
  ctx.textAlign = 'right';
  ctx.fillText(`Coins ${s.coins}   Key ${s.hasKey ? '✓' : '—'}   Relic ${s.hasRelic ? '✓' : '—'}   ${Math.floor(s.elapsed / 60)}:${String(Math.floor(s.elapsed % 60)).padStart(2, '0')}`, 948, 22);
  // detection eye
  if (s.detection > 1) {
    ctx.fillStyle = 'rgba(8,10,16,0.8)'; ctx.fillRect(380, 44, 200, 16);
    ctx.fillStyle = s.detection > 65 ? '#ff5340' : '#ffb03a';
    ctx.fillRect(384, 48, 192 * (s.detection / 100), 8);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('SEEN', 480, 42);
  }
  if (s.messageT > 0 && s.message) {
    ctx.fillStyle = 'rgba(8,10,16,0.82)'; ctx.fillRect(180, 596, 600, 26);
    ctx.fillStyle = '#ffe9a8'; ctx.font = '13px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(s.message, 480, 613);
  }
}

function panel(ctx, title, lines, foot) {
  ctx.fillStyle = 'rgba(5,7,12,0.72)'; ctx.fillRect(0, 0, 960, 640);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f4f7fb';
  ctx.font = 'bold 44px system-ui'; ctx.fillText(title, 480, 218);
  ctx.font = '16px system-ui'; ctx.fillStyle = '#c9d4e4';
  lines.forEach((l, i) => ctx.fillText(l, 480, 268 + i * 26));
  ctx.font = 'bold 15px system-ui'; ctx.fillStyle = '#ffd34d';
  ctx.fillText(foot, 480, 268 + lines.length * 26 + 22);
}

export function render(ctx, world, screen, score) {
  drawWorld(ctx, world);
  if (screen === SCREEN_PLAY) { drawHud(ctx, world); return; }
  if (screen === SCREEN_TITLE) {
    drawHud(ctx, world);
    panel(ctx, 'SHADOW VAULT', [
      'The Lantern Watch patrols the vault floor all night.',
      'Slip past their lantern cones, hide in hedges and behind crates,',
      'take the brass key, steal the Moonlight Relic, and vanish',
      'through the garden gate. Fill a guard\u2019s gaze and you are caught.',
      '',
      'WASD / arrows move · Shift sneak · Click or Q tosses a coin',
    ], 'Press Enter to begin the night');
    return;
  }
  // over / won share the panel; main.js passes the right wording via score text
  drawHud(ctx, world);
  const won = world.state.screen === 'won';
  panel(ctx, won ? 'A CLEAN GETAWAY' : 'CAUGHT IN THE LIGHT', won ? [
    'You melt into the garden dark with the Moonlight Relic.',
    `Time ${Math.floor(world.state.elapsed)}s · Spotted ${world.state.spotted} time(s) · Coins left ${world.state.coins}`,
    `Score ${score}`,
  ] : [
    'A lantern swings round — and finds you.',
    'The Watch is patient. Learn a patrol, use the hedges, try again.',
    `You lasted ${Math.floor(world.state.elapsed)}s${world.state.hasRelic ? ' and held the Relic' : ''}.`,
  ], 'Press Enter to play again');
}
