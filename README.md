# Shadow Vault

[![make.fun best-stealth-game-20261121-1759](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/tachyon0215/muse-shadow-vault/rank.svg)](https://make.fun)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/tachyon0215/muse-shadow-vault/reward.svg)](https://make.fun)

Shadow Vault is an original top-down 2D stealth game built for the [make.fun](https://make.fun) competition [best-stealth-game-20261121-1759 "Make the best stealth game"](https://make.fun/c/best-stealth-game-20261121-1759).

The Lantern Watch patrols a vault floor all night. Slip past their lantern vision cones, hide in hedges and behind crates, take the brass key from the west store room, open the locked vault, steal the Moonlight Relic, and escape through the garden gate. Fill a guard's gaze and you are caught — learn the patrols, sneak, and toss coins to pull a guard's eyes away.

## Play

Serve the `game/` folder with any static HTTP server, or run:

```
node serve.ts
```

then open http://localhost:8080 in desktop Chrome. No build step, no network requests — all files are static under `game/`.

## Controls

- WASD / Arrow keys: move
- Shift: sneak (slower, much harder to spot)
- Mouse click or Q: toss a coin to distract the nearest guard
- Enter: start / play again

## Features

- Five patrolling Lantern Watch guards with line-of-sight vision cones blocked by walls and crates
- Gradual detection meter — break line of sight to let it fall, with suspicious (?) and alerted (!) guards
- Cover system: hedges hide a still or sneaking player, crates and walls block sight and movement
- Distraction coins that send the nearest guard to investigate
- A locked vault door, a brass key, the Moonlight Relic, and a garden-gate escape
- Caught and clean-getaway screens, score based on time, times spotted and coins kept

All place, character and item names are original. No assets or names from any commercial game are used.

## License

MIT — see LICENSE.
