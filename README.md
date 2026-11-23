# Ember Harbor — Tactical Tide Duel

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/ariaeren/best-card-game-20261122-1826-karyawan/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/ariaeren/best-card-game-20261122-1826-karyawan/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

An original five-tide card duel for the make.fun **best-card-game-20261122-1826** bounty. Read the rival's open card, choose a card and tide, and turn Ember → Gale → Tide → Ember to take the harbor.

## Play locally

```sh
node serve.ts --port 8080
```

Open `http://localhost:8080`. Click a card then a tide, or press `1`–`5` then `A` `S` `D` `F` `G`.

## Build the hand-in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` into the output directory and writes `dossier.json`.

<sub>Entered on [make.fun](https://make.fun/?ref=KARYAWAN01&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
