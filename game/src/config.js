// EMBER HARBOR — shared constants for the night harbor card duel.
// Every visual token is drawn with CSS shapes; no external art or fonts are used.

export const ELEMENTS = {
  ember: {
    id: 'ember',
    name: 'Ember',
    shape: 'triangle',
    color: '#ff6b3d',
    glow: 'rgba(255, 107, 61, 0.55)',
    defeats: 'gale',
  },
  gale: {
    id: 'gale',
    name: 'Gale',
    shape: 'diamond',
    color: '#69e6a5',
    glow: 'rgba(105, 230, 165, 0.5)',
    defeats: 'tide',
  },
  tide: {
    id: 'tide',
    name: 'Tide',
    shape: 'circle',
    color: '#55b8ff',
    glow: 'rgba(85, 184, 255, 0.55)',
    defeats: 'ember',
  },
};

export const ELEMENT_ORDER = ['ember', 'gale', 'tide'];

export const TIDE_NAMES = ['I', 'II', 'III', 'IV', 'V'];

export const TIDE_TITLES = [
  'Shallow Breakwater',
  'Lantern Reach',
  'Crosscurrent',
  'Gull Rock',
  'Harbor Mouth',
];

export const RULES = {
  tidesPerRegatta: 5,
  winningScore: 3,
  elementalBonus: 2,
  handSize: 9,
  cardMin: 1,
  cardMax: 9,
};

// Fixed seeds: each screenshot scene is reproducible and never depends on wall-clock time.
export const SHOT_SEEDS = {
  title: 0x51421,
  play: 0x99117,
  win: 0x47721,
  loss: 0x73319,
};

export const SCREEN_LABELS = {
  title: 'TITLE',
  play: 'PLAY',
  win: 'WIN',
  loss: 'LOSS',
};
