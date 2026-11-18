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
- **H:** open the Harbor. **L:** open the Ledger of Cartographers.
- **Enter:** continue from a campaign win into the Inkdeep.

## Four-chart campaign

Every new expedition begins in **Verdigris Reach**. Completing a chart unlocks the next region in the atlas and lets you choose a skiff refit; the atlas does not offer stage-skipping. Regional hazards build across **Verdigris Reach** (a pursuing eel), **Ember Straits** (a spitter turret firing slow ink bolts), **Violet Gyre** (a patroller and rotating currents), and **Pale Meridian** (two reinforced wards, a spitter, currents, and the Sovereign Rift). Each ward takes two separate successful loop seals; sealing both wards unlocks the final capturable rift.

Rescue buoys restore hull and thread. Each successful capture also restores thread. Multi-rift loops and consecutive seals award score bonuses; damage and failed loops break the combo. Between charts choose reinforced hull, a faster engine, or greater thread regeneration and capacity. Chart grades reflect damage and completion time. Best score, unlocked regions, and each region’s best medal are stored locally when a chart is completed.

The HUD tracks region/chart, remaining capture objectives, hull, thread, dash recharge, score, combo, and rescues. Expedition results show elapsed time, hits, rescues, seals, score, and earned chart medals.

## Sovereigns, Harbor, and Ledger

Runs award sovereigns for seals (10 each), extra captures in a multi-rift loop (25 per additional capture), rescues (15 each), and chart medals (50 for Bronze, 100 for Silver, 200 for Gold). Earnings are banked on a win or loss and persist in the browser's local storage.

Visit the Harbor with **H** to spend sovereigns on five persistent tuning tracks. Hull Plating, Sail Trim, and Thread Spool each have three tiers at 100, 200, and 350 sovereigns: they increase maximum hull, skiff speed, and maximum thread plus regeneration, respectively. Dash Coil has three tiers at 125, 250, and 400 sovereigns, extending the dash and shortening its cooldown. Ward Lodestone has two tiers at 200 and 400 sovereigns and reduces ward hit requirements by one per tier (to a minimum of one hit).

The Ledger (**L**) ranks your best campaign score alongside five cartographers: Rhea Vance, Silas Tide, Mara Quell, Orin Blackwake, and Vesper Reef. It lists their fixed target scores for each chart and Inkdeep depth records. Newly bested rivals are saved locally, announced at run end, and award a 75-sovereign bonus each.

## Inkdeep

After winning the campaign by sealing the Sovereign Rift, press **Enter** to continue into the endless Inkdeep. It cycles the four charts in order, increasing hazard and rift scaling by `1 + 0.35 × cycle`. The completed-chart depth and its best depth are tracked, with the best persisted locally. Inkdeep run earnings are multiplied by `1 + 0.5 × cycle` when banked.

## Run locally

Serve the repository's `game/` directory with a local static HTTP server. For example, from the repository root run `python3 -m http.server 8000` and open `http://localhost:8000/game/`.

To generate the Make.fun dossier with Node 22, run `node main.ts` from the repository root.

## Implementation

Vanilla JavaScript, Canvas 2D, and local procedural WebAudio. No external game libraries, downloaded assets, or runtime network dependencies.
