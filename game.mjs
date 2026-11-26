import { SIZE, createPuzzle, getEdition, pathBetween, snapToLine } from './puzzles.mjs';

const byId = (id) => document.getElementById(id);
const edition = getEdition(location.search);
const { words, grid } = createPuzzle(edition);
const storageKey = `jolaordaleit:1:${edition.id}`;
const letters = byId('letters');
const marks = byId('marks');
const counter = byId('word-count');
const progress = byId('progress');
const feedback = byId('feedback');
const timer = byId('timer');
const state = readState();
let anchor = null;
let pointer = null;
let focusIndex = 0;
let tick;

byId('edition').textContent = edition.label;
byId('theme').textContent = edition.theme;
byId('intro').textContent = edition.id === 'sample'
  ? 'Prófaðu að finna tíu jólaorð. Dagleg orðaleit hefst 1. desember.'
  : 'Finndu tíu falin jólaorð. Ný þraut á hverjum degi til 24. desember.';
if (edition.id === 'sample') byId('word-title').textContent = 'Falin orð';

const wordItems = new Map(words.map((word, index) => {
  const item = document.createElement('li');
  item.className = 'word';

  const box = document.createElement('span');
  box.className = 'word-mark';
  box.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.className = 'word-text';
  label.textContent = edition.words[index];

  const note = document.createElement('span');
  note.className = 'sr-only';
  note.hidden = true;
  note.textContent = ' (fundið)';

  item.append(box, label, note);
  byId('words').append(item);
  return [word, { item, box, note }];
}));

const cells = grid.map((letter, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'letter';
  button.dataset.index = index;
  button.textContent = letter;
  button.tabIndex = index === 0 ? 0 : -1;
  button.setAttribute('aria-label', `${letter}, röð ${Math.floor(index / SIZE) + 1}, dálkur ${index % SIZE + 1}`);
  button.setAttribute('aria-pressed', 'false');
  letters.append(button);
  return button;
});

const currentMark = document.createElement('div');
currentMark.className = 'mark current';
currentMark.hidden = true;
marks.append(currentMark);
for (const [word, path] of state.found) drawFound(word, path);

updateProgress();
runTimer();
if (state.finishedAt) announceCompletion();
byId('game').hidden = false;

byId('help-button').addEventListener('click', () => byId('help').showModal());

function wordAlong(path) {
  const forward = path.map((index) => grid[index]).join('');
  if (words.includes(forward)) return forward;
  const reverse = [...forward].reverse().join('');
  return words.includes(reverse) ? reverse : null;
}

function readState() {
  const saved = { startedAt: null, finishedAt: null, found: new Map() };

  try {
    const data = JSON.parse(localStorage.getItem(storageKey));
    if (!Number.isFinite(data?.startedAt) || data.startedAt <= 0) return saved;

    saved.startedAt = data.startedAt;
    for (const path of Array.isArray(data.paths) ? data.paths : []) {
      if (!Array.isArray(path) || path.length !== 2) continue;
      const checked = pathBetween(...path);
      const word = wordAlong(checked);
      if (word) saved.found.set(word, checked);
    }

    if (saved.found.size === words.length) {
      const finishedAt = Number.isFinite(data.finishedAt) ? data.finishedAt : Date.now();
      saved.finishedAt = Math.max(saved.startedAt, finishedAt);
    }
  } catch {
    // A blocked or unavailable localStorage does not prevent playing.
  }

  return saved;
}

function saveState() {
  try {
    const { startedAt, finishedAt, found } = state;
    const paths = [...found.values()].map((path) => [path[0], path.at(-1)]);
    localStorage.setItem(storageKey, JSON.stringify({ startedAt, finishedAt, paths }));
  } catch {
    // Progress remains available for this page view.
  }
}

function elapsedSeconds() {
  if (!state.startedAt) return 0;
  return Math.max(0, Math.floor(((state.finishedAt ?? Date.now()) - state.startedAt) / 1000));
}

function paintTimer() {
  const elapsed = elapsedSeconds();
  if (timer.dateTime === `PT${elapsed}S`) return;

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  timer.dateTime = `PT${elapsed}S`;
}

function runTimer() {
  clearInterval(tick);
  paintTimer();
  if (state.startedAt && !state.finishedAt) tick = setInterval(paintTimer, 200);
}

function startTimer() {
  if (state.startedAt) return;
  state.startedAt = Date.now();
  saveState();
  runTimer();
}

function announce(message, kind = '') {
  feedback.dataset.kind = kind;
  feedback.textContent = message;
}

function announceWrong() {
  const emphasis = document.createElement('strong');
  emphasis.textContent = 'ekki eitt af orðum dagsins';
  feedback.dataset.kind = 'wrong';
  feedback.replaceChildren('Þetta er ', emphasis, ', reyndu betur');
}

function announceCompletion() {
  announce(`Vel gert! Þú fannst öll ${words.length} orðin á ${timer.textContent}.`, 'found');
}

function updateProgress() {
  const count = state.found.size;
  const adjective = count === 1 ? 'fundið' : 'fundin';
  counter.textContent = `${count} af ${words.length} orðum ${adjective}`;
  progress.max = words.length;
  progress.value = count;
  if (state.finishedAt) letters.setAttribute('aria-disabled', 'true');
}

function positionMark(mark, path) {
  const first = path[0];
  const last = path.at(-1);
  const startX = first % SIZE + 0.5;
  const startY = Math.floor(first / SIZE) + 0.5;
  const dx = last % SIZE + 0.5 - startX;
  const dy = Math.floor(last / SIZE) + 0.5 - startY;

  mark.style.setProperty('--x', `${(startX + dx / 2) * 100 / SIZE}%`);
  mark.style.setProperty('--y', `${(startY + dy / 2) * 100 / SIZE}%`);
  mark.style.setProperty('--length', `${(Math.hypot(dx, dy) + 0.78) * 100 / SIZE}%`);
  mark.style.setProperty('--angle', `${Math.atan2(dy, dx)}rad`);
  mark.hidden = false;
}

function drawFound(word, path) {
  const mark = document.createElement('div');
  mark.className = 'mark';
  positionMark(mark, path);
  marks.prepend(mark);

  const { item, box, note } = wordItems.get(word);
  item.classList.add('found');
  box.textContent = '✓';
  note.hidden = false;
}

function setAnchor(index) {
  if (anchor !== null) cells[anchor].setAttribute('aria-pressed', 'false');
  anchor = index;
  if (anchor !== null) cells[anchor].setAttribute('aria-pressed', 'true');
  if (anchor === null) currentMark.hidden = true;
  else positionMark(currentMark, [anchor]);
}

function submitPath(start, end) {
  setAnchor(null);
  const path = pathBetween(start, end);

  if (path.length < 2) {
    announce('Veldu stafi í beinni línu.', 'wrong');
    return;
  }

  const word = wordAlong(path);
  if (!word) {
    announceWrong();
    return;
  }
  if (state.found.has(word)) {
    announce('Þú hefur þegar fundið þetta orð.');
    return;
  }

  state.found.set(word, path);
  drawFound(word, path);
  if (state.found.size === words.length) {
    state.finishedAt = Date.now();
    runTimer();
    announceCompletion();
  } else {
    const displayed = edition.words[words.indexOf(word)];
    announce(`Orðið „${displayed}“ er fundið.`, 'found');
  }
  updateProgress();
  saveState();
}

function selectEndpoint(index) {
  if (state.finishedAt) return;
  startTimer();
  if (anchor === null) {
    announce('');
    setAnchor(index);
  } else if (anchor === index) {
    setAnchor(null);
  } else {
    submitPath(anchor, index);
  }
}

function cellIndex(target) {
  const cell = target?.closest('.letter');
  return cell && letters.contains(cell) ? Number(cell.dataset.index) : null;
}

function followPointer(event) {
  const index = cellIndex(document.elementFromPoint(event.clientX, event.clientY));
  if (index === null) return;

  if (index !== pointer.start) pointer.moved = true;
  pointer.end = snapToLine(pointer.start, index);
  if (pointer.moved) positionMark(currentMark, pathBetween(pointer.start, pointer.end));
}

function cancelPointer(event) {
  if (pointer?.id !== event.pointerId) return;

  pointer = null;
  setAnchor(anchor);
}

letters.addEventListener('pointerdown', (event) => {
  const index = cellIndex(event.target);
  if (state.finishedAt || pointer || !event.isPrimary || event.button !== 0 || index === null) return;

  startTimer();
  pointer = { id: event.pointerId, start: index, end: index, moved: false };
  letters.setPointerCapture(event.pointerId);
});

letters.addEventListener('pointermove', (event) => {
  if (pointer?.id === event.pointerId) followPointer(event);
});

letters.addEventListener('pointerup', (event) => {
  if (pointer?.id !== event.pointerId) return;

  followPointer(event);
  const { start, end, moved } = pointer;
  pointer = null;
  if (!moved) selectEndpoint(start);
  else if (start !== end) submitPath(start, end);
  else setAnchor(null);
});

letters.addEventListener('pointercancel', cancelPointer);
letters.addEventListener('lostpointercapture', cancelPointer);

letters.addEventListener('click', (event) => {
  // Pointer releases already handle mouse, pen and touch. Keyboard and AT clicks have detail 0.
  const index = cellIndex(event.target);
  if (event.detail === 0 && index !== null) selectEndpoint(index);
});

letters.addEventListener('focusin', (event) => {
  const index = cellIndex(event.target);
  if (index === null || index === focusIndex) return;
  cells[focusIndex].tabIndex = -1;
  cells[index].tabIndex = 0;
  focusIndex = index;
});

letters.addEventListener('keydown', (event) => {
  const index = cellIndex(event.target);
  if (index === null) return;
  const column = index % SIZE;
  let next = index;

  switch (event.key) {
    case 'ArrowLeft': if (column > 0) next--; break;
    case 'ArrowRight': if (column < SIZE - 1) next++; break;
    case 'ArrowUp': if (index >= SIZE) next -= SIZE; break;
    case 'ArrowDown': if (index < SIZE * (SIZE - 1)) next += SIZE; break;
    case 'Home': next -= column; break;
    case 'End': next += SIZE - 1 - column; break;
    case 'Escape': setAnchor(null); break;
    default: return;
  }

  event.preventDefault();
  if (next !== index) cells[next].focus();
});
