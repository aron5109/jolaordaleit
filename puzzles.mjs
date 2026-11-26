export const SIZE = 10;

const ALPHABET = 'AÁBDÐEÉFGHIÍJKLMNOÓPRSTUÚVXYÝÞÆÖ';
const DIRECTIONS = [
  [0, 1], [1, 1], [1, 0], [1, -1],
  [0, -1], [-1, -1], [-1, 0], [-1, 1],
];
const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Atlantic/Reykjavik',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const SAMPLE = ['Jólaundirbúningur', 'Jólakort Kerti Snjór Kanill Greni Gjafir Bjalla Sleði Vettlingar Mandarína'];

export const DECEMBER = [
  ['Aðventan', 'Aðventa Krans Kerti Stjarna Ilmur Dagatal Gluggi Lukt Vænting Bið'],
  ['Fyrsti snjórinn', 'Snjór Mjöll Fönn Skafl Snjókorn Fannfergi Fjúk Hélan Föl Flyksa'],
  ['Bakað fyrir jólin', 'Piparkökur Kanill Engifer Negull Kökudeig Hveiti Kakó Smákökur Kökudós Bökun'],
  ['Jólatréð', 'Greni Fura Toppur Skraut Jólakúla Jólatré Barr Sería Borði Trjáfótur'],
  ['Í jólapóstinum', 'Jólakort Frímerki Umslag Póstur Kveðja Heimili Bréf Póstkassi Lím Skrautrit'],
  ['Á svellinu', 'Skautar Svell Ísbrot Kuldi Renna Jökull Ísing Rennsli Íshella Gaddur'],
  ['Kósíkvöld', 'Teppi Kakóbolli Kósí Bók Sófi Ullarteppi Eldstæði Rökkur Kvöld Friður'],
  ['Út í frostið', 'Úlpa Húfa Vettlingar Trefill Stígvél Ullarpeysa Vetrarskór Kuldagalli Sokkar Kragi'],
  ['Í snjónum', 'Sleði Skíði Snjókarl Snjóbolti Gulrót Hálka Snjókast Brekka Gönguskíði Skíðalyfta'],
  ['Jólaljósin', 'Ljós Lukt Logi Birtan Lampi Stjörnur Perur Kyndill Ljósadýrð Geisli'],
  ['Verkstæði jólasveinanna', 'Leikfang Sög Hamar Pensill Tré Lím Borð Lakk Verkfæri Nagli'],
  ['Fyrstu jólasveinarnir', 'Stekkur Fjárhús Kind Ær Gil Skán Mjólk Staur Skuggi Jólasveinn'],
  ['Á jólamarkaði', 'Markaður Sölubás Handverk Skraut Leir Prjón Vefnaður Sulta Sælgæti Jólagjöf'],
  ['Jólalögin', 'Lag Taktur Kór Nóta Vers Söngur Hljómar Söngbók Bjalla Viðlag'],
  ['Í jólakonfektinu', 'Konfekt Súkkulaði Karamella Marsípan Núggat Döðlur Möndlur Flórsykur Kókos Rúsínur'],
  ['Gjafirnar', 'Pappír Límband Slaufa Pakki Merkimiði Gjafapoki Gjöf Böggull Skæri Snæri'],
  ['Jól í eldhúsinu', 'Laufabrauð Hangikjöt Kartafla Flatkaka Rjúpa Hnetusteik Rauðkál Baunir Sveppasósa Malt'],
  ['Jólakötturinn', 'Köttur Feldur Skott Veiðihár Lopapeysa Kló Mjálm Lopasokkar Prjónaföt Loppur'],
  ['Vetrarhiminn', 'Tungl Stjarna Norðurljós Rökkur Myrkur Himinn Geisli Næturfrost Ský Hvel'],
  ['Í jólafríi', 'Jólabíó Kakó Jólabók Púsl Spil Kósí Náttföt Morgunn Hvíld Popppoki'],
  ['Við kertaljós', 'Kerti Kveikur Vax Logi Kertaglas Ljómi Eldspýta Stjaki Skuggi Friðsæld'],
  ['Jólabókaflóðið', 'Bók Skáldsaga Höfundur Kafli Lesandi Kápa Bókamerki Bókabúð Ljóð Blaðsíða'],
  ['Þorláksmessa', 'Skata Hamsatólg Þorlákur Suða Rúgbrauð Lykt Messudagur Pottur Jólaös Þrif'],
  ['Aðfangadagur', 'Jólamessa Jólahátíð Fjölskylda Jólaklukka Matarlykt Jólaborð Gjafir Jólaföt Hlýja Fagnaður'],
];

export function getEdition(search = '', now = new Date()) {
  const preview = new URLSearchParams(search).get('previewDate');
  const isDecember = (date) => /^\d{4}-12-(0[1-9]|1\d|2[0-4])$/.test(date ?? '');
  const local = Object.fromEntries(DATE_FORMAT.formatToParts(now).map(({ type, value }) => [type, value]));
  const today = `${local.year}-${local.month}-${local.day}`;
  const firstDay = `${local.year}-12-01`;
  const lastDay = `${local.year}-12-24`;
  let date = null;
  if (isDecember(preview)) date = preview;
  else if (today >= firstDay) date = today > lastDay ? lastDay : today;

  if (!date) {
    return { id: 'sample', label: 'Prufuþraut', theme: SAMPLE[0], words: SAMPLE[1].split(' ') };
  }

  const day = Number(date.slice(-2));
  const [theme, words] = DECEMBER[day - 1];
  return {
    id: preview === date ? `preview-${date}` : date,
    label: `${day}. desember`,
    theme,
    words: words.split(' '),
  };
}

function randomFor(seed) {
  let state = 2166136261;
  for (const letter of seed) {
    state = Math.imul(state ^ letter.charCodeAt(0), 16777619);
  }
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function inside(row, column) {
  return row >= 0 && row < SIZE && column >= 0 && column < SIZE;
}

export function pathBetween(start, end) {
  if (!Number.isInteger(start) || !Number.isInteger(end) ||
      start < 0 || end < 0 || start >= SIZE ** 2 || end >= SIZE ** 2) return [];

  const row = Math.floor(start / SIZE);
  const column = start % SIZE;
  const rowDelta = Math.floor(end / SIZE) - row;
  const columnDelta = end % SIZE - column;
  const length = Math.max(Math.abs(rowDelta), Math.abs(columnDelta));

  if (rowDelta && columnDelta && Math.abs(rowDelta) !== Math.abs(columnDelta)) return [];

  return Array.from({ length: length + 1 }, (_, step) =>
    (row + Math.sign(rowDelta) * step) * SIZE + column + Math.sign(columnDelta) * step);
}

export function snapToLine(start, end) {
  const row = Math.floor(start / SIZE);
  const column = start % SIZE;
  const rowDelta = Math.floor(end / SIZE) - row;
  const columnDelta = end % SIZE - column;
  const angle = Math.atan2(rowDelta, columnDelta);
  const direction = (Math.round(angle / (Math.PI / 4)) + 8) % 8;
  const [dr, dc] = DIRECTIONS[direction];
  let steps = Math.round((rowDelta * dr + columnDelta * dc) / (dr ** 2 + dc ** 2));

  while (steps > 0 && !inside(row + dr * steps, column + dc * steps)) steps--;
  return start + (dr * SIZE + dc) * steps;
}

function positionsFor(grid, word, random) {
  const positions = [];
  const offset = word.length - 1;
  for (let row = 0; row < SIZE; row++) {
    for (let column = 0; column < SIZE; column++) {
      for (const [dr, dc] of DIRECTIONS) {
        const endRow = row + dr * offset;
        const endColumn = column + dc * offset;
        if (!inside(endRow, endColumn)) continue;

        const cells = pathBetween(row * SIZE + column, endRow * SIZE + endColumn);
        if (cells.some((cell, index) => grid[cell] && grid[cell] !== word[index])) continue;

        const overlap = cells.filter((cell) => grid[cell]).length;
        positions.push({ cells, score: random() + Math.min(overlap, 2) * 0.16 });
      }
    }
  }
  return positions;
}

export function createPuzzle(edition) {
  const words = edition.words.map((word) => word.toLocaleUpperCase('is'));
  const ordered = [...words].sort((a, b) => b.length - a.length);
  const random = randomFor(edition.id.replace(/^preview-/, ''));

  for (let attempt = 0; attempt < 24; attempt++) {
    const grid = Array(SIZE ** 2).fill('');
    let placed = 0;
    for (const word of ordered) {
      const candidates = positionsFor(grid, word, random);
      if (!candidates.length) break;

      const best = candidates.reduce((a, b) => a.score > b.score ? a : b);
      best.cells.forEach((cell, index) => { grid[cell] = word[index]; });
      placed++;
    }
    if (placed === ordered.length) {
      return {
        words,
        grid: grid.map((letter) => letter || ALPHABET[Math.floor(random() * ALPHABET.length)]),
      };
    }
  }

  throw new Error('Ekki tókst að setja orðin í stafanetið.');
}
