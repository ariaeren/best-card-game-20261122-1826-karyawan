// Mouse, touch and keyboard input for EMBER HARBOR.

import { playDraw, playFanfare, playLossPoint, playPlace, playSelect, playWinPoint } from './audio.js';
import { playCard, selectCard } from './state.js';

const TIDE_KEYS = { a: 0, s: 1, d: 2, f: 3, g: 4 };

/** Bind all input to the stable app shell; card and lane nodes are replaced on render. */
export function bindInput(root, app) {
  root.addEventListener('click', (event) => {
    const state = app.getState();

    const action = event.target.closest('[data-action]');
    if (action) {
      const kind = action.dataset.action;
      if (kind === 'start' || kind === 'restart' || kind === 'new') {
        app.newMatch();
      } else if (kind === 'round') {
        app.newRound();
      }
      return;
    }

    const card = event.target.closest('[data-hand-index]');
    if (card && state.screen === 'play') {
      const index = Number(card.dataset.handIndex);
      if (selectCard(state, index)) {
        playSelect();
        app.render();
      }
      return;
    }

    const lane = event.target.closest('[data-lane]');
    if (lane && state.screen === 'play') {
      attemptPlay(app, Number(lane.dataset.lane));
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const state = app.getState();
    const key = event.key.toLowerCase();

    if (key === 'enter' && state.screen !== 'play') {
      app.newMatch();
      event.preventDefault();
      return;
    }
    if (state.screen !== 'play') return;

    if (/^[1-5]$/.test(key)) {
      if (selectCard(state, Number(key) - 1)) {
        playSelect();
        app.render();
      }
      event.preventDefault();
      return;
    }
    if (key in TIDE_KEYS) {
      attemptPlay(app, TIDE_KEYS[key]);
      event.preventDefault();
    }
  });
}

function attemptPlay(app, laneIndex) {
  const state = app.getState();
  if (state.selected === null) {
    state.lastToast = 'Choose one of your cards first.';
    app.render();
    return;
  }
  const result = playCard(state, laneIndex);
  if (!result) {
    state.lastToast = 'That tide is already taken. Try another.';
    app.render();
    return;
  }
  if (!result.resolved) {
    playPlace();
  } else if (result.outcome.winner === 'player') {
    playWinPoint();
  } else if (result.outcome.winner === 'rival') {
    playLossPoint();
  } else {
    playDraw();
  }
  if (result.matchOver) playFanfare(state.result === 'win');
  app.render();
}
