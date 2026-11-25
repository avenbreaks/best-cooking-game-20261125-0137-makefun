// Every tuning number, dish, ingredient and screen rectangle in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the
// window, so no rule below depends on the screen size.
export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** One shift lasts this long; the shift timer is the game's clock. */
export const SHIFT_SECONDS = 150;
export const HEARTS = 3;

/** Order spawn: first order after this many seconds, then the interval shrinks. */
export const ORDER = {
  firstAfter: 3,
  intervalStart: 14,
  intervalMin: 7,
  intervalStep: 0.8,
  timeStart: 50,
  timeMin: 32,
  timeStep: 1.5,
  maxActive: 3,
};

/** An ingredient the cook can pick up. `prep` says what it needs before it can be plated:
 *  instant goes straight to the hand, chop goes to the chopping board, fry goes to the wok. */
export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', key: '1', prep: 'instant', color: '#f5f0dc' },
  { id: 'mie', name: 'Mie', key: '2', prep: 'instant', color: '#f2c14e' },
  { id: 'ayam', name: 'Ayam', key: '3', prep: 'chop', color: '#e08a5a', chopClicks: 2 },
  { id: 'telur', name: 'Telur', key: '4', prep: 'fry', color: '#f7e8c8', frySeconds: 4 },
  { id: 'sayur', name: 'Sayur', key: '5', prep: 'chop', color: '#5da24a', chopClicks: 3 },
  { id: 'sambal', name: 'Sambal', key: '6', prep: 'instant', color: '#c0392b' },
];

/** What a raw ingredient becomes once its prep is done. */
export const PREPPED = {
  ayam: 'ayam-goreng',
  telur: 'telur-goreng',
  sayur: 'sayur',
};

/** Frying times on the wok, in seconds, by the raw item that goes in. */
export const FRY_SECONDS = { telur: 4, 'ayam-potong': 5 };

/** The menu: each dish is the set of finished ingredients a plate must hold. */
export const DISHES = [
  { id: 'nasi-goreng', name: 'Nasi Goreng', needs: ['nasi', 'telur-goreng', 'sambal'], coins: 14, color: '#e67e22' },
  { id: 'mie-ayam', name: 'Mie Ayam', needs: ['mie', 'ayam-goreng', 'sayur'], coins: 16, color: '#d4a017' },
  { id: 'sate-ayam', name: 'Sate Ayam', needs: ['ayam-goreng', 'sambal', 'sayur'], coins: 15, color: '#b9770e' },
  { id: 'nasi-ayam', name: 'Nasi Ayam Geprek', needs: ['nasi', 'ayam-goreng', 'sambal'], coins: 15, color: '#ca6f1e' },
  { id: 'mie-goreng', name: 'Mie Goreng', needs: ['mie', 'telur-goreng', 'sayur', 'sambal'], coins: 18, color: '#935116' },
];

/** Finished ingredient labels, for the plate and the order tickets. */
export const FINISHED_NAMES = {
  nasi: 'Nasi',
  mie: 'Mie',
  sambal: 'Sambal',
  sayur: 'Sayur',
  'telur-goreng': 'Telur Goreng',
  'ayam-goreng': 'Ayam Goreng',
  'ayam-potong': 'Ayam Potong',
  telur: 'Telur',
  ayam: 'Ayam',
};

/** Screen rectangles, shared by input hit-testing and the renderer. */
export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 56 },
  orders: { x: 24, y: 74, w: 560, h: 132 },
  orderSlot: { w: 176, h: 124, gap: 12 },
  board: { x: 48, y: 252, w: 300, h: 170 },
  plate: { x: 490, y: 240, w: 300, h: 196 },
  wok: { x: 932, y: 252, w: 300, h: 170 },
  stations: { x: 24, y: 500, w: 1232, h: 120 },
  station: { w: 190, h: 108, gap: 18 },
  serve: { x: 1052, y: 636, w: 204, h: 64 },
  trash: { x: 900, y: 636, w: 136, h: 64 },
  hand: { x: 24, y: 636, w: 320, h: 64 },
};

export const PALETTE = {
  wall: '#3d2b1f',
  wallTop: '#54382a',
  counter: '#7a5230',
  counterTop: '#a9713f',
  floor: '#2e2118',
  panel: '#fff7e6',
  panelEdge: '#d9c39a',
  text: '#2b1d12',
  muted: '#7a6a58',
  cream: '#fdf3d8',
  gold: '#f2c14e',
  red: '#c0392b',
  green: '#5da24a',
  teal: '#2e8b74',
  ink: '#241a12',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best shift is kept between visits (this browser only). */
export const BEST_KEY = 'dapur-kilat.best';
