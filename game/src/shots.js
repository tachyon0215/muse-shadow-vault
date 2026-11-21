// Screenshot scenes ?shot=start|play|end — deterministic staging so the
// maker's screenshots are real renders of this code, identically framed.
// start: title over the live floor. play: mid-heist — key taken, player
// crouched in a hedge while a guard's cone sweeps close and a tossed coin
// draws a second guard away. end: the clean-getaway screen.
import { STEP } from './config.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_OVER } from './render.js';

export function stageShot(name, world) {
  const s = world.state;
  if (name === 'play') {
    s.screen = 'play';
    // Walk the player up the west side and into the store room for the key.
    for (let i = 0; i < 6 / STEP; i++) world.step(STEP, { x: 0, y: -1 }, false);
    for (let i = 0; i < 1.2 / STEP; i++) world.step(STEP, { x: 0.4, y: -1 }, false);
    s.hasKey = true;
    // Stage the money shot: player held still in the central hedge,
    // a patrol cone close by, detection just starting to rise.
    s.player.x = 424; s.player.y = 114; s.player.face = 0.6; s.player.moving = false;
    const g = s.guards[0];
    g.x = 438; g.y = 208; g.angle = -Math.PI / 2 + 0.25; g.wait = 0;
    const g2 = s.guards[1];
    g2.mode = 'investigate'; g2.tx = 596; g2.ty = 330; g2.x = 500; g2.y = 348; g2.angle = 0.5;
    s.coinFx = { x: 596, y: 330, t: 0.4 };
    s.coins = 2; s.elapsed = 47; s.detection = 34;
    s.message = 'Held still in the hedge — the lantern sweeps past.';
    s.messageT = 99;
    for (let i = 0; i < 0.4 / STEP; i++) world.step(STEP, { x: 0, y: 0 }, false);
    s.detection = 34; // keep the staged tension readable in the still
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'end') {
    s.screen = 'play';
    for (let i = 0; i < 2 / STEP; i++) world.step(STEP, { x: 1, y: 0 }, false);
    s.hasKey = true; s.hasRelic = true; s.elapsed = 132; s.spotted = 2; s.coins = 1;
    s.screen = 'won';
    return { screen: SCREEN_OVER, best: world.score() };
  }
  // start
  s.screen = 'play';
  for (let i = 0; i < 3 / STEP; i++) world.step(STEP, { x: 0, y: 0 }, false);
  s.screen = 'title';
  return { screen: SCREEN_TITLE, best: 0 };
}
