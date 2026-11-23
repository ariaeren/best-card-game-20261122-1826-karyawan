// Mutable match state and all legal transitions for EMBER HARBOR.
// Rendering never mutates this module; input calls the transitions below.

import { RULES } from './config.js';
import { dealHands, drawReplacement, makeRng } from './deck.js';
import { resolveCards } from './rules.js';
import { chooseRivalMove } from './rival.js';

function emptyLane(index) {
  return {
    index,
    rival: null,
    player: null,
    resolved: false,
    winner: null,
    outcome: null,
    points: { player: 0, rival: 0 },
  };
}

export function createMatch(seed) {
  return {
    rng: makeRng(seed),
    seed,
    screen: 'play',
    phase: 'play',
    score: { player: 0, rival: 0 },
    regatta: 1,
    tideIndex: 0,
    lanes: Array.from({ length: RULES.tidesPerRegatta }, (_, i) => emptyLane(i)),
    playerHand: [],
    rivalHand: [],
    stock: [],
    lastPlayerByLane: Array(RULES.tidesPerRegatta).fill(null),
    selected: null,
    intent: null,
    log: [],
    lastToast: 'The rival sets the first tide.',
    lastPulse: null,
  };
}

/** Deal new hands and clear the five tides while keeping the match score. */
export function beginRegatta(state) {
  const dealt = dealHands(state.rng);
  state.playerHand = dealt.player;
  state.rivalHand = dealt.rival;
  state.stock = dealt.stock;
  state.lanes = Array.from({ length: RULES.tidesPerRegatta }, (_, i) => emptyLane(i));
  state.lastPlayerByLane = Array(RULES.tidesPerRegatta).fill(null);
  state.tideIndex = 0;
  state.selected = null;
  state.intent = null;
  state.phase = 'play';
  return state;
}

/** The rival openly commits one card to a tide at the start of a turn. */
export function placeRivalIntent(state) {
  const move = chooseRivalMove(state);
  if (!move) {
    // No legal lane left: start a fresh regatta; the score survives.
    if (state.tideIndex >= RULES.tidesPerRegatta || state.rivalHand.length === 0) {
      state.regatta += 1;
      beginRegatta(state);
      return placeRivalIntent(state);
    }
    return null;
  }
  const [card] = state.rivalHand.splice(move.handIndex, 1);
  const lane = state.lanes[move.laneIndex];
  lane.rival = card;
  state.intent = {
    laneIndex: move.laneIndex,
    card,
    kind: move.kind,
    reason: move.reason,
  };
  state.lastToast = move.reason;
  return state.intent;
}

/** Start a brand-new match with a shuffled deck. */
export function startMatch(seed) {
  const state = createMatch(seed);
  beginRegatta(state);
  placeRivalIntent(state);
  return state;
}

export function selectCard(state, handIndex) {
  if (state.phase !== 'play') return false;
  if (handIndex < 0 || handIndex >= state.playerHand.length) return false;
  state.selected = state.selected === handIndex ? null : handIndex;
  return true;
}

/** Play the selected card into a tide; resolve immediately if both slots are filled. */
export function playCard(state, laneIndex) {
  if (state.phase !== 'play' || state.selected === null) return null;
  const lane = state.lanes[laneIndex];
  if (!lane || lane.resolved || lane.player) return null;

  const [card] = state.playerHand.splice(state.selected, 1);
  state.selected = null;
  lane.player = card;
  state.lastPlayerByLane[laneIndex] = card;

  if (!lane.rival) {
    state.lastToast = `${card.value} waiting at tide ${laneIndex + 1} — the rival will answer it.`;
    placeRivalIntent(state);
    return { resolved: false, lane };
  }

  const outcome = resolveCards(card, lane.rival);
  lane.resolved = true;
  lane.winner = outcome.winner;
  lane.outcome = outcome;
  if (outcome.winner === 'player') {
    state.score.player += 1;
    lane.points.player = 1;
  } else if (outcome.winner === 'rival') {
    state.score.rival += 1;
    lane.points.rival = 1;
  }
  state.tideIndex += 1;
  state.lastPulse = outcome.winner;
  state.lastToast = outcome.reason;
  state.log.push({ tide: laneIndex, winner: outcome.winner, player: card, rival: lane.rival });

  if (state.score.player >= RULES.winningScore) {
    state.phase = 'over';
    state.result = 'win';
    return { resolved: true, lane, outcome, matchOver: true };
  }
  if (state.score.rival >= RULES.winningScore) {
    state.phase = 'over';
    state.result = 'loss';
    return { resolved: true, lane, outcome, matchOver: true };
  }

  if (state.tideIndex >= RULES.tidesPerRegatta) {
    state.regatta += 1;
    beginRegatta(state);
  }
  if (state.playerHand.length === 0) {
    state.playerHand.push(drawReplacement(state.stock, state.rng));
  }
  placeRivalIntent(state);
  return { resolved: true, lane, outcome, matchOver: false };
}

/** Human-readable snapshot used by the HUD and the screenshot scenes. */
export function tideCounter(state) {
  return `${state.tideIndex}/${RULES.tidesPerRegatta}`;
}
