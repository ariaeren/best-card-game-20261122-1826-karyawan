// Hand-built, seeded scenes for the four deterministic screenshots.
// These scenes use the same state shape and renderer as a live match.

import { SHOT_SEEDS } from './config.js';
import { resolveCards } from './rules.js';
import { createMatch, startMatch } from './state.js';

const C = (value, element) => ({ value, element, serial: `shot-${element}-${value}` });

function finishLane(state, index, playerCard, rivalCard) {
  const lane = state.lanes[index];
  lane.player = playerCard;
  lane.rival = rivalCard;
  lane.resolved = true;
  lane.outcome = resolveCards(playerCard, rivalCard);
  lane.winner = lane.outcome.winner;
  lane.points[lane.winner === 'draw' ? 'player' : lane.winner] = 1;
  state.lastPlayerByLane[index] = playerCard;
  return lane;
}

export function makeShotScene(mode) {
  const seed = SHOT_SEEDS[mode] ?? SHOT_SEEDS.play;
  if (mode === 'title') {
    const state = startMatch(seed);
    state.screen = 'title';
    state.phase = 'title';
    return state;
  }

  const state = createMatch(seed);
  state.screen = mode === 'play' ? 'play' : mode;
  state.score = mode === 'win' ? { player: 3, rival: 1 } : mode === 'loss' ? { player: 1, rival: 3 } : { player: 2, rival: 1 };
  state.regatta = 2;
  state.tideIndex = mode === 'play' ? 2 : 4;
  state.playerHand = [C(2, 'gale'), C(5, 'tide'), C(8, 'ember'), C(3, 'gale'), C(6, 'tide')];
  state.rivalHand = [C(4, 'tide'), C(7, 'gale'), C(2, 'ember'), C(6, 'gale')];
  state.stock = [];

  finishLane(state, 0, C(7, 'tide'), C(5, 'ember'));   // Tide beats Ember: +2
  finishLane(state, 1, C(6, 'tide'), C(8, 'gale'));    // Gale beats Tide: rival point
  finishLane(state, 2, C(9, 'ember'), C(6, 'gale'));   // Ember beats Gale: +2

  if (mode !== 'play') {
    // Win: Gale 6 turns Tide 4 (+2). Loss: Ember 7 turns Gale 3 (+2).
    const last = mode === 'win' ? C(4, 'tide') : C(7, 'ember');
    const mine = mode === 'win' ? C(6, 'gale') : C(3, 'gale');
    finishLane(state, 3, mine, last);
    state.tideIndex = 4;
    state.phase = 'over';
    state.result = mode;
    state.lastPulse = mode === 'win' ? 'player' : 'rival';
  } else {
    const pending = C(8, 'tide');
    state.lanes[3].rival = pending;
    state.lastPlayerByLane[3] = C(7, 'ember');
    state.intent = {
      laneIndex: 3,
      card: pending,
      kind: 'counter',
      reason: 'COUNTER · Tide 8 turns your 7 Ember at tide IV',
    };
    state.selected = 2;
    state.lastToast = state.intent.reason;
  }
  return state;
}
