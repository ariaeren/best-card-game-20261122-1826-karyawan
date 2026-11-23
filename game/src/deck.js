// Deterministic deck construction and shuffling for EMBER HARBOR.
// A deck is 27 cards: the values 1..9 in each of the three elements.

import { ELEMENT_ORDER, RULES } from './config.js';

/** Small, fast seeded PRNG so screenshot scenes are byte-for-byte stable. */
export function makeRng(seed) {
  let state = seed >>> 0;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates in place, driven by the seeded generator. */
export function shuffleInPlace(cards, rng) {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = cards[i];
    cards[i] = cards[j];
    cards[j] = tmp;
  }
  return cards;
}

export function createDeck() {
  const cards = [];
  for (const element of ELEMENT_ORDER) {
    for (let value = RULES.cardMin; value <= RULES.cardMax; value++) {
      cards.push({ value, element, serial: `${element}-${value}` });
    }
  }
  return cards;
}

/** Two face-up hands drawn from one freshly shuffled deck. */
export function dealHands(rng) {
  const deck = shuffleInPlace(createDeck(), rng);
  return {
    player: deck.splice(0, RULES.handSize),
    rival: deck.splice(0, RULES.handSize),
    stock: deck,
  };
}

/** Pull a replacement card, recycling the stock when it runs dry. */
export function drawReplacement(stock, rng) {
  if (stock.length === 0) {
    stock.push(...createDeck());
  }
  return shuffleInPlace(stock, rng).pop();
}

export function cardPower(card) {
  return card.value;
}
