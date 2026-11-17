# INKBOUND: The Last Cartographer

A browser-based nautical charting game set on a midnight teal ink sea. Navigate the survey skiff, draw glowing thread loops around rifts, and chart all three tides.

[![Game Badge](https://make.fun/badge/best-game-01.svg)](https://make.fun/c/best-game-01)
[![Rank Badge](https://make.fun/badge/best-game-01/Pritahi/best-game/rank.svg)](https://make.fun/c/best-game-01)
[![Reward Badge](https://make.fun/badge/best-game-01/Pritahi/best-game/reward.svg)](https://make.fun/c/best-game-01)

## Play

Serve a loop around a glowing rift, return close to its gold starting point, then release the drawing control to seal it. Seal three rifts in each of three tides while steering clear of pursuing ink-eels. The run ends in victory after all nine rifts are sealed, or in defeat if the skiff's hull reaches zero.

## Controls

- **WASD / Arrow keys:** steer the skiff.
- **Hold Space:** draw a luminous thread loop while steering.
- **Release Space near the gold origin (within 65 px):** attempt to seal the loop. A rift must be enclosed; otherwise the loop is discarded.
- **Mouse / touch drag:** hold and drag to steer and draw a loop; release near its origin to attempt a seal.
- **Shift:** dash with brief invulnerability; dash recharges over time and uses thread.
- **P:** pause or resume.
- **M:** mute or unmute procedural sound.
- **R:** restart the expedition during play, pause, or after a result.

Between tides, choose one skiff upgrade: reinforced hull, a faster engine, or increased thread regeneration and capacity.

## Run locally

Serve the repository's `game/` directory with any local static HTTP server, then open its `index.html` in a modern browser. For example, from the repository root, run `python3 -m http.server 8000` and open `http://localhost:8000/game/`.

To generate the Make.fun dossier with Node 22, run `node main.ts` from the repository root.

## Implementation

The game uses vanilla JavaScript, Canvas 2D, and local procedural WebAudio. It has no external game libraries, asset downloads, or runtime network dependencies.
