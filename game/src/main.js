// Shadow Vault — entry point: fixed-step loop, screens, restart.
// A complete original stealth game: patrols with vision cones, cover,
// a locked vault, a relic, distraction coins and an escape gate.
import { STEP } from './config.js';
import { createWorld } from './world.js';
import { render, SCREEN_TITLE, SCREEN_PLAY, SCREEN_OVER } from './render.js';
import { createInput } from './input.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const params = new URLSearchParams(location.search);
const shot = params.get('shot');

let world = createWorld();
let input = createInput(canvas);
let screen = SCREEN_TITLE;
let best = Number(localStorage.getItem('shadow-vault-best') || 0);

if (shot) {
  const staged = stageShot(shot, world);
  screen = staged.screen;
  render(ctx, world, screen, world.score());
  status.textContent = `Shadow Vault screenshot scene: ${shot}`;
} else {
  let last = performance.now();
  let acc = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    acc += Math.min(0.1, (now - last) / 1000);
    last = now;
    while (acc >= STEP) {
      acc -= STEP;
      if (screen === SCREEN_TITLE) {
        world.state.screen = 'play';
        world.step(STEP, { x: 0, y: 0 });
        if (input.takeConfirm()) { screen = SCREEN_PLAY; world.state.elapsed = 0; }
      } else if (screen === SCREEN_PLAY) {
        world.step(STEP, input.control());
        if (world.state.screen === 'caught') screen = SCREEN_OVER;
        if (world.state.screen === 'won') {
          screen = SCREEN_OVER;
          const sc = world.score();
          if (sc > best) { best = sc; localStorage.setItem('shadow-vault-best', String(best)); }
        }
      } else if (screen === SCREEN_OVER) {
        if (input.takeConfirm()) {
          world = createWorld();
          input = createInput(canvas);
          world.state.screen = 'play';
          screen = SCREEN_PLAY;
        }
      }
    }
    render(ctx, world, screen, world.score());
    status.textContent = screen === SCREEN_PLAY
      ? `Detection ${Math.round(world.state.detection)} percent. ${world.state.hasRelic ? 'Reach the garden gate.' : 'Find the key, then the relic.'}`
      : screen === SCREEN_TITLE ? 'Shadow Vault. Press Enter to begin.' : 'Press Enter to play again.';
  }
  requestAnimationFrame(frame);
}
