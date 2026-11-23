// The harbor rival follows a published, readable policy.
// 1) Counter: use the strongest card that would beat your last card in an open tide.
// 2) Otherwise contest: drop the strongest card on the tide with the fewest points.

import { ELEMENTS, TIDE_NAMES } from './config.js';
import { candidateBeats, effectivePower } from './rules.js';

function contestedPoints(lane) {
  return lane.points.player + lane.points.rival;
}

/**
 * Pick a move from the rival hand. The result is deterministic for a given state,
 * so a player can read the intent and plan the counter-play.
 */
export function chooseRivalMove(state) {
  const open = [];
  state.lanes.forEach((lane, laneIndex) => {
    if (!lane.rival && !lane.resolved) open.push(laneIndex);
  });
  if (open.length === 0 || state.rivalHand.length === 0) return null;

  const counters = [];
  for (const laneIndex of open) {
    const target = state.lastPlayerByLane[laneIndex];
    if (!target) continue;
    state.rivalHand.forEach((card, handIndex) => {
      if (candidateBeats(card, target)) {
        counters.push({
          card,
          handIndex,
          laneIndex,
          kind: 'counter',
          priority: effectivePower(card, target.element) * 100 - contestedPoints(state.lanes[laneIndex]),
        });
      }
    });
  }

  if (counters.length > 0) {
    counters.sort((a, b) => b.priority - a.priority || a.laneIndex - b.laneIndex);
    const best = counters[0];
    const target = state.lastPlayerByLane[best.laneIndex];
    return {
      ...best,
      reason: `COUNTER · answers your ${target.value} ${ELEMENTS[target.element].name} at tide ${TIDE_NAMES[best.laneIndex]}`,
    };
  }

  // No counter available: contest the quietest tide, leading with the highest print.
  const quietest = [...open].sort((a, b) =>
    contestedPoints(state.lanes[a]) - contestedPoints(state.lanes[b]) || a - b)[0];
  let bestIndex = 0;
  for (let i = 1; i < state.rivalHand.length; i++) {
    if (state.rivalHand[i].value > state.rivalHand[bestIndex].value) bestIndex = i;
  }
  return {
    card: state.rivalHand[bestIndex],
    handIndex: bestIndex,
    laneIndex: quietest,
    kind: 'contest',
    reason: `CONTEST · fewest points at tide ${TIDE_NAMES[quietest]} (${contestedPoints(state.lanes[quietest])} pt)`,
  };
}
