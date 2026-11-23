// Resolution rules for EMBER HARBOR.
// Ember > Gale > Tide > Ember. Winning on element adds +2 to the printed value.

import { ELEMENTS, RULES } from './config.js';

export function elementBeats(attacker, defender) {
  return Boolean(ELEMENTS[attacker] && ELEMENTS[attacker].defeats === defender);
}

/** Effective strength of a card when facing an opponent element. */
export function effectivePower(card, foeElement) {
  const bonus = elementBeats(card.element, foeElement) ? RULES.elementalBonus : 0;
  return card.value + bonus;
}

/** Compare two cards and return { winner, playerPower, rivalPower, reason }. */
export function resolveCards(playerCard, rivalCard) {
  const playerPower = effectivePower(playerCard, rivalCard.element);
  const rivalPower = effectivePower(rivalCard, playerCard.element);
  const winner = playerPower > rivalPower ? 'player' : rivalPower > playerPower ? 'rival' : 'draw';
  let reason = 'even tide — no point';
  if (winner === 'player') {
    reason = elementBeats(playerCard.element, rivalCard.element)
      ? `${ELEMENTS[playerCard.element].name} turns the current: +${RULES.elementalBonus}`
      : 'higher print takes the tide';
  } else if (winner === 'rival') {
    reason = elementBeats(rivalCard.element, playerCard.element)
      ? `${ELEMENTS[rivalCard.element].name} turns the current: +${RULES.elementalBonus}`
      : 'rival print outranks yours';
  }
  return { winner, playerPower, rivalPower, reason };
}

/** Would the candidate win a head-to-head against the chosen target? */
export function candidateBeats(candidate, target) {
  return resolveCards(candidate, target).winner === 'player';
}

export function ribbonText() {
  return 'EMBER beats GALE · GALE beats TIDE · TIDE beats EMBER · +2 on elemental win';
}
