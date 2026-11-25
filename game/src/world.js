// The kitchen's rules: orders arrive on the board, ingredients are prepped
// on the board and the wok, the plate is assembled in the middle, and a
// plate that matches an open order is served for coins before its timer
// runs out. One hand holds one finished ingredient at a time.
import {
  DISHES,
  FRY_SECONDS,
  HEARTS,
  INGREDIENTS,
  ORDER,
  PREPPED,
  SHIFT_SECONDS,
  STEP,
} from './config.js';
import { SOUNDS } from './audio.js';

export const EVENT_SERVE = 1;
export const EVENT_EXPIRE = 2;
export const EVENT_OVER = 4;
export const EVENT_WOK_DONE = 8;
export const EVENT_CHOP = 16;

let orderSeq = 0;

function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id);
}

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  return a.every((item) => b.includes(item));
}

export function createWorld(random) {
  const state = freshState();

  function freshState() {
    return {
      time: 0,
      coins: 0,
      combo: 0,
      bestCombo: 0,
      hearts: HEARTS,
      served: 0,
      expired: 0,
      orders: [],
      plate: [],
      hand: null,
      board: null,
      wok: null,
      spawnIn: ORDER.firstAfter,
      rush: false,
      shake: 0,
      toast: '',
      toastIn: 0,
      lastServe: null,
    };
  }

  function orderTime() {
    const level = Math.floor(state.time / 30);
    return Math.max(ORDER.timeMin, ORDER.timeStart - level * ORDER.timeStep);
  }

  function spawnInterval() {
    const level = Math.floor(state.time / 30);
    return Math.max(ORDER.intervalMin, ORDER.intervalStart - level * ORDER.intervalStep);
  }

  function spawnOrder() {
    spawnDish(random.pick(DISHES).id);
  }

  function spawnDish(dishId) {
    const dish = DISHES.find((item) => item.id === dishId) ?? random.pick(DISHES);
    const seconds = orderTime();
    state.orders.push({
      id: (orderSeq += 1),
      dish,
      needs: dish.needs.map((id) => ({ id, done: false })),
      timeLeft: seconds,
      maxTime: seconds,
      reward: dish.coins,
    });
  }

  function markNeeds() {
    for (const order of state.orders) {
      for (const need of order.needs) need.done = state.plate.includes(need.id);
    }
  }

  function toast(message, seconds) {
    state.toast = message;
    state.toastIn = seconds;
  }

  /** One player action: a station tile, the board, the wok, the plate, serve or trash. */
  function act(action) {
    if (action.zone === 'station') return actStation(action.id);
    if (action.zone === 'board') return actBoard();
    if (action.zone === 'wok') return actWok();
    if (action.zone === 'plate') return actPlate();
    if (action.zone === 'serve') return actServe();
    if (action.zone === 'trash') return actTrash();
    return 0;
  }

  function actStation(id) {
    const item = ingredientById(id);
    if (!item) return 0;
    if (item.prep === 'instant') {
      if (state.hand) return reject('Tangan penuh — taruh dulu di piring');
      state.hand = id;
      SOUNDS.pickup();
      return 0;
    }
    if (item.prep === 'chop') {
      if (state.board) return reject('Talenan sibuk');
      state.board = { id, chopsLeft: item.chopClicks, done: false };
      SOUNDS.place();
      return 0;
    }
    // fry: raw egg goes straight into the wok from the station.
    if (state.wok) return reject('Wajan sibuk');
    state.wok = { id, t: 0, total: FRY_SECONDS[id], done: false };
    SOUNDS.sizzle();
    return 0;
  }

  function actBoard() {
    const board = state.board;
    if (!board) return 0;
    if (!board.done) {
      board.chopsLeft -= 1;
      SOUNDS.chop();
      if (board.chopsLeft <= 0) board.done = true;
      return EVENT_CHOP;
    }
    if (state.hand) return reject('Tangan penuh — taruh dulu di piring');
    state.hand = board.id === 'ayam' ? 'ayam-potong' : 'sayur';
    state.board = null;
    SOUNDS.pickup();
    return 0;
  }

  function actWok() {
    const wok = state.wok;
    if (!wok) {
      if (state.hand === 'telur' || state.hand === 'ayam-potong') {
        state.wok = { id: state.hand, t: 0, total: FRY_SECONDS[state.hand], done: false };
        state.hand = null;
        SOUNDS.sizzle();
      }
      return 0;
    }
    if (!wok.done) return 0;
    if (state.hand) return reject('Tangan penuh — taruh dulu di piring');
    state.hand = PREPPED[wok.id] ?? wok.id;
    state.wok = null;
    SOUNDS.pickup();
    return 0;
  }

  function actPlate() {
    if (!state.hand) return 0;
    if (state.plate.includes(state.hand)) return reject('Sudah ada di piring');
    if (state.plate.length >= 4) return reject('Piring penuh');
    state.plate.push(state.hand);
    state.hand = null;
    markNeeds();
    SOUNDS.place();
    return 0;
  }

  function actServe() {
    if (state.plate.length === 0) return reject('Piring masih kosong');
    const match = state.orders.find((order) => sameSet(state.plate, order.dish.needs));
    if (!match) return reject('Tidak cocok dengan pesanan mana pun');
    const timeBonus = Math.round((match.timeLeft / match.maxTime) * 10);
    const comboBonus = Math.min(state.combo, 5);
    const earned = match.reward + timeBonus + comboBonus;
    state.coins += earned;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.served += 1;
    state.lastServe = { dish: match.dish.name, earned, combo: state.combo };
    state.orders = state.orders.filter((order) => order !== match);
    state.plate = [];
    markNeeds();
    SOUNDS.ding();
    toast(`+${earned} koin — ${match.dish.name} tersaji!`, 1.6);
    return EVENT_SERVE;
  }

  function actTrash() {
    if (state.plate.length === 0 && !state.hand) return 0;
    state.plate = [];
    state.hand = null;
    markNeeds();
    SOUNDS.error();
    return 0;
  }

  function reject(message) {
    state.shake = 0.35;
    toast(message, 1.2);
    SOUNDS.error();
    return 0;
  }

  function step(dt, paused) {
    let events = 0;
    if (paused) return events;
    state.time += dt;
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
    if (state.toastIn > 0) state.toastIn = Math.max(0, state.toastIn - dt);

    const shiftLeft = SHIFT_SECONDS - state.time;
    if (shiftLeft <= 60 && !state.rush) {
      state.rush = true;
      SOUNDS.rush();
      toast('RUSH! 60 detik terakhir — kejar pesanan!', 2.2);
    }

    if (state.wok && !state.wok.done) {
      state.wok.t += dt;
      if (state.wok.t >= state.wok.total) {
        state.wok.done = true;
        events |= EVENT_WOK_DONE;
        SOUNDS.ding();
      }
    }

    state.spawnIn -= dt;
    if (state.spawnIn <= 0 && state.orders.length < ORDER.maxActive) {
      spawnOrder();
      state.spawnIn = spawnInterval();
    }

    for (const order of state.orders) order.timeLeft -= dt;
    const expired = state.orders.filter((order) => order.timeLeft <= 0);
    if (expired.length > 0) {
      state.orders = state.orders.filter((order) => order.timeLeft > 0);
      state.expired += expired.length;
      state.hearts -= expired.length;
      state.combo = 0;
      markNeeds();
      events |= EVENT_EXPIRE;
      SOUNDS.error();
      toast(expired.length > 1 ? `${expired.length} pesanan hangus!` : 'Pesanan hangus — pelanggan pergi!', 1.8);
    }

    if (state.hearts <= 0 || state.time >= SHIFT_SECONDS) events |= EVENT_OVER;
    return events;
  }

  function reset() {
    Object.assign(state, freshState());
    state.spawnIn = ORDER.firstAfter;
  }

  return { state, act, step, reset, spawnOrder, spawnDish, markNeeds };
}
