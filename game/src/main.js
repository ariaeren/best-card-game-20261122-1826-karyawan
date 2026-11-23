// EMBER HARBOR bootstrap. Selects a live match or a deterministic shot scene.

import { bindInput } from './input.js';
import { initShell, render } from './render.js';
import { makeShotScene } from './shots.js';
import { beginRegatta, placeRivalIntent, startMatch } from './state.js';

const SHOT_MODES = ['title', 'play', 'win', 'loss'];

function randomSeed() {
  const words = new Uint32Array(1);
  crypto.getRandomValues(words);
  return words[0];
}

const requestedShot = new URLSearchParams(window.location.search).get('shot');
const shotMode = SHOT_MODES.includes(requestedShot) ? requestedShot : null;

let state;
if (shotMode) {
  state = makeShotScene(shotMode);
} else {
  state = startMatch(randomSeed());
  state.screen = 'title';
  state.phase = 'title';
}

const root = document.getElementById('app');
initShell(root);
render(state);

bindInput(root, {
  getState: () => state,
  render: () => render(state),
  newMatch: () => {
    state = startMatch(randomSeed());
    render(state);
  },
  newRound: () => {
    if (state.phase === 'over' || state.screen === 'title') return;
    state.regatta += 1;
    beginRegatta(state);
    placeRivalIntent(state);
    render(state);
  },
});
