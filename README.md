# INKBOUND: The Last Cartographer

Chart the midnight sea in a survey skiff. Capture glowing rifts with luminous thread while ink hazards pursue you across four distinct regions.

[![Game Badge](https://make.fun/badge/best-game-01.svg)](https://make.fun/c/best-game-01)
[![Rank Badge](https://make.fun/badge/best-game-01/Pritahi/best-game/rank.svg)](https://make.fun/c/best-game-01)
[![Reward Badge](https://make.fun/badge/best-game-01/Pritahi/best-game/reward.svg)](https://make.fun/c/best-game-01)

## Controls

- **WASD / Arrow keys:** steer the skiff.
- **Hold Space:** draw a thread loop while steering; release within 65 px of the gold origin to attempt a seal.
- **Mouse or touch drag:** steer and draw; release near the starting point to attempt a seal.
- **Shift:** dash, granting brief invulnerability and consuming thread. Dash recharges over time.
- **P:** pause or resume. **M:** mute or unmute procedural sound. **R:** restart the expedition.

## Four-chart campaign

Every new expedition begins in **Verdigris Reach**. Completing a chart unlocks the next region in the atlas and lets you choose a skiff refit; the atlas does not offer stage-skipping. Regional hazards build across **Verdigris Reach** (a pursuing eel), **Ember Straits** (a spitter turret firing slow ink bolts), **Violet Gyre** (a patroller and rotating currents), and **Pale Meridian** (two reinforced wards, a spitter, currents, and the Sovereign Rift). Each ward takes two separate successful loop seals; sealing both wards unlocks the final capturable rift.

Rescue buoys restore hull and thread. Each successful capture also restores thread. Multi-rift loops and consecutive seals award score bonuses; damage and failed loops break the combo. Between charts choose reinforced hull, a faster engine, or greater thread regeneration and capacity. Chart grades reflect damage and completion time. Best score, unlocked regions, and each region’s best medal are stored locally when a chart is completed.

The HUD tracks region/chart, remaining capture objectives, hull, thread, dash recharge, score, combo, and rescues. Expedition results show elapsed time, hits, rescues, seals, score, and earned chart medals.

## Run locally

Serve the repository's `game/` directory with a local static HTTP server. For example, from the repository root run `python3 -m http.server 8000` and open `http://localhost:8000/game/`.

To generate the Make.fun dossier with Node 22, run `node main.ts` from the repository root.

## Implementation

Vanilla JavaScript, Canvas 2D, and local procedural WebAudio. No external game libraries, downloaded assets, or runtime network dependencies.
