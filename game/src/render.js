// Rendering layer: turns match state into HTML. It owns no game rules.

import { ELEMENTS, ELEMENT_ORDER, RULES, TIDE_NAMES, TIDE_TITLES } from './config.js';
import { tideCounter } from './state.js';

let nodes = null;

function elementShape(element) {
  return `<span class="shape shape-${ELEMENTS[element].shape}" aria-hidden="true"></span>`;
}

/** A large, readable card: big numeral, coloured shape, gold edge. */
export function cardMarkup(card, options = {}) {
  const el = ELEMENTS[card.element];
  const classes = ['game-card', `el-${card.element}`];
  if (options.selected) classes.push('is-selected');
  if (options.ghost) classes.push('is-ghost');
  if (options.small) classes.push('is-small');
  if (options.dealt) classes.push('is-dealt');
  const attrs = options.handIndex !== undefined ? ` data-hand-index="${options.handIndex}" tabindex="0" role="button"` : '';
  return `<article class="${classes.join(' ')}"${attrs} style="--el:${el.color};--el-glow:${el.glow}">
    <span class="card-corner">${card.value}</span>
    <span class="card-symbol">${elementShape(card.element)}</span>
    <span class="card-number">${card.value}</span>
    <span class="card-name">${el.name.toUpperCase()}</span>
    <span class="card-corner card-corner-bottom">${card.value}</span>
  </article>`;
}

function ribbonMarkup() {
  return ELEMENT_ORDER.map((id, i) => {
    const el = ELEMENTS[id];
    const next = ELEMENTS[ELEMENT_ORDER[(i + 1) % ELEMENT_ORDER.length]];
    return `<span class="ribbon-item" style="--el:${el.color}">
      ${elementShape(id)}<b>${el.name}</b><span class="ribbon-beats">beats</span>${elementShape(next.id)}<b>${next.name}</b>
    </span>`;
  }).join('<span class="ribbon-sep">·</span>');
}

function laneMarkup(state, lane) {
  const targeted = state.intent && state.intent.laneIndex === lane.index && !lane.resolved;
  const status = lane.resolved
    ? `<span class="result result-${lane.winner}">${lane.winner === 'draw' ? 'EVEN' : lane.winner === 'player' ? '+1 YOU' : '+1 RIVAL'}</span>`
    : targeted ? '<span class="result result-intent">INCOMING ↓</span>' : '<span class="result result-open">OPEN</span>';
  return `<section class="lane ${targeted ? 'is-targeted' : ''} ${lane.resolved ? 'is-resolved' : ''} lane-${lane.winner ?? 'pending'}" data-lane="${lane.index}">
    <header class="lane-head"><span class="lane-roman">${TIDE_NAMES[lane.index]}</span><span class="lane-title">${TIDE_TITLES[lane.index]}</span></header>
    <div class="slot slot-rival">
      <span class="slot-tag">RIVAL</span>
      ${lane.rival ? cardMarkup(lane.rival, { small: true }) : '<span class="slot-empty">— open —</span>'}
      ${targeted ? '<span class="intent-arrow" aria-hidden="true">▼</span>' : ''}
    </div>
    <div class="lane-mid"><span class="lane-divider"></span><span class="lane-score">${lane.points.player} · ${lane.points.rival}</span><span class="lane-divider"></span></div>
    <div class="slot slot-player">
      <span class="slot-tag">YOU</span>
      ${lane.player ? cardMarkup(lane.player, { small: true }) : '<span class="slot-empty">— answer —</span>'}
    </div>
    <footer class="lane-foot">${status}</footer>
  </section>`;
}

function overlayMarkup(state) {
  if (state.screen === 'title') {
    return `<div class="overlay overlay-title">
      <div class="overlay-card title-card">
        <p class="eyebrow">A TACTICAL TIDE DUEL</p>
        <h1>EMBER<br><span>HARBOR</span></h1>
        <p class="lede">Five tides. Three elements. One harbor to take.</p>
        <div class="help-grid">
          <div><b>01 · READ THE INTENT</b><p>The rival places a card face-up at the start of every turn. Its arrow marks the tide it wants.</p></div>
          <div><b>02 · ANSWER A TIDE</b><p>Click a card, then a tide — or press <kbd>1</kbd>–<kbd>5</kbd> then <kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><kbd>F</kbd><kbd>G</kbd>.</p></div>
          <div><b>03 · TURN THE CURRENT</b><p>${ELEMENTS.ember.name} → ${ELEMENTS.gale.name} → ${ELEMENTS.tide.name} → ${ELEMENTS.ember.name}. Elemental wins score +2 strength.</p></div>
          <div><b>04 · TAKE THE HARBOR</b><p>Win a tide with the stronger total. First to <b>${RULES.winningScore}</b> points wins the match. Draws score nothing.</p></div>
        </div>
        <div class="element-cycle">${ribbonMarkup()}</div>
        <button class="primary-button" data-action="start">BEGIN THE REGATTA</button>
      </div>
    </div>`;
  }
  if (state.screen === 'win' || state.screen === 'loss') {
    const won = state.screen === 'win';
    return `<div class="overlay ${won ? 'overlay-win' : 'overlay-loss'}">
      <div class="overlay-card end-card">
        <p class="eyebrow">${won ? 'THE HARBOR IS YOURS' : 'THE HARBOR SLIPS AWAY'}</p>
        <h1>${won ? 'TIDE TURNED' : 'TIDE LOST'}</h1>
        <p class="end-score">YOU ${state.score.player} <span class="end-dash">—</span> RIVAL ${state.score.rival}</p>
        <p class="lede">${won ? 'Your reads held through the crosscurrent.' : 'The rival read the current one move better.'}</p>
        <button class="primary-button" data-action="restart">PLAY AGAIN</button>
      </div>
    </div>`;
  }
  return '';
}

/** Build the static shell once; later renders only replace inner regions. */
export function initShell(root) {
  root.innerHTML = `
    <div class="harbor" aria-hidden="true">
      <div class="sky"></div><div class="moon"></div><div class="stars"></div>
      <div class="skyline"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="tower tower-left"><i></i><b></b></div>
      <div class="tower tower-right"><i></i><b></b></div>
      <div class="flags"><span></span><span></span><span></span><span></span></div>
      <div class="water"><div class="ripple r1"></div><div class="ripple r2"></div><div class="ripple r3"></div></div>
      <div class="boat boat-one"><i></i><b></b></div>
      <div class="boat boat-two"><i></i><b></b></div>
      <div class="lanterns"><i></i><i></i><i></i><i></i></div>
    </div>
    <div class="table-wrap">
      <header class="topbar">
        <div class="brand"><span class="brand-mark">◆</span><div><b>EMBER HARBOR</b><small>TACTICAL TIDE DUEL</small></div></div>
        <div class="scoreboard" id="scoreboard"><span class="you">YOU <b id="score-player">0</b></span><span class="dash">—</span><span class="rival">RIVAL <b id="score-rival">0</b></span></div>
        <div class="meta"><span class="chip" id="tide-chip">TIDE 0/5</span><span class="chip chip-regatta" id="regatta-chip">REGATTA 1</span></div>
        <div class="game-actions"><button data-action="round">NEW ROUND</button><button data-action="new">NEW GAME</button></div>
      </header>
      <div class="element-ribbon" id="ribbon">${ribbonMarkup()}</div>
      <section class="rival-zone">
        <div class="zone-label"><span>RIVAL HAND · FACE UP</span><span id="intent-readout"></span></div>
        <div class="hand rival-hand" id="rival-hand"></div>
      </section>
      <section class="board" id="lanes"></section>
      <section class="player-zone">
        <div class="zone-label"><span>YOUR HAND · CLICK CARD THEN TIDE</span><span id="hint-readout">Pick a card to sail it into a tide.</span></div>
        <div class="hand player-hand" id="player-hand"></div>
      </section>
      <footer class="footer-hint"><span>KEYS <kbd>1</kbd>–<kbd>5</kbd> cards · <kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><kbd>F</kbd><kbd>G</kbd> tides</span><span>EMBER &gt; GALE &gt; TIDE &gt; EMBER</span></footer>
    </div>
    <div id="overlay-host"></div>`;

  nodes = {
    scoreboard: root.querySelector('#scoreboard'),
    scorePlayer: root.querySelector('#score-player'),
    scoreRival: root.querySelector('#score-rival'),
    tideChip: root.querySelector('#tide-chip'),
    regattaChip: root.querySelector('#regatta-chip'),
    rivalHand: root.querySelector('#rival-hand'),
    playerHand: root.querySelector('#player-hand'),
    lanes: root.querySelector('#lanes'),
    intent: root.querySelector('#intent-readout'),
    hint: root.querySelector('#hint-readout'),
    overlay: root.querySelector('#overlay-host'),
    table: root.querySelector('.table-wrap'),
  };
}

export function render(state) {
  if (!nodes) return;
  nodes.scorePlayer.textContent = state.score.player;
  nodes.scoreRival.textContent = state.score.rival;
  nodes.tideChip.textContent = `TIDE ${tideCounter(state)}`;
  nodes.regattaChip.textContent = `REGATTA ${state.regatta}`;
  nodes.scoreboard.classList.remove('pulse-player', 'pulse-rival');
  if (state.lastPulse) {
    // Force the animation to restart on every resolved tide.
    void nodes.scoreboard.offsetWidth;
    nodes.scoreboard.classList.add(`pulse-${state.lastPulse}`);
  }

  nodes.rivalHand.innerHTML = state.rivalHand.map((card) => cardMarkup(card, { small: true })).join('');
  nodes.playerHand.innerHTML = state.playerHand.map((card, i) =>
    cardMarkup(card, { handIndex: i, selected: state.selected === i })).join('');
  nodes.lanes.innerHTML = state.lanes.map((lane) => laneMarkup(state, lane)).join('');

  nodes.intent.innerHTML = state.intent
    ? `<b class="intent-kind">${state.intent.kind === 'counter' ? 'COUNTER' : 'CONTEST'}</b> ↳ TIDE ${TIDE_NAMES[state.intent.laneIndex]} <span class="intent-reason">${state.intent.reason}</span>`
    : '';
  nodes.hint.textContent = state.selected !== null
    ? `Card ${state.selected + 1} ready — choose a tide.`
    : state.lastToast || 'Pick a card to sail it into a tide.';
  nodes.table.classList.toggle('is-dimmed', state.screen !== 'play');
  nodes.overlay.innerHTML = overlayMarkup(state);
}
