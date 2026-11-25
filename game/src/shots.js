// The screenshot scenes behind ?shot=start|play|serve|end. Each one plays
// the real rules forward from a fresh world for a fixed number of steps,
// steered by a scripted list of the same actions a player can take, so the
// frame is what a short game really looks like and the same seed always
// gives the same frame.
import { STEP } from './config.js';
import { EVENT_OVER, EVENT_SERVE } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const SAMPLE = STEP;

/** Run the world forward, firing the scripted actions at their times. */
function playScript(world, script, seconds) {
  let at = 0;
  for (let t = 0; t < seconds; t += SAMPLE) {
    while (at < script.length && script[at][0] <= t) {
      world.act(script[at][1]);
      at += 1;
    }
    const events = world.step(SAMPLE, false);
    if (events & EVENT_OVER) break;
  }
  while (at < script.length) {
    world.act(script[at][1]);
    at += 1;
  }
}

function station(id) {
  return { zone: 'station', id };
}
const board = { zone: 'board' };
const wok = { zone: 'wok' };
const plate = { zone: 'plate' };
const serve = { zone: 'serve' };

/**
 * Set `world` to the named scene (start, play, serve or end; any other name
 * is start) and return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  const state = world.state;
  if (name === 'play') {
    // Order a Nasi Goreng, then build it halfway: nasi on the plate, a telur
    // frying in the wok, sayur chopping on the board — kitchen, order board,
    // ingredients on the counter, one dish mid-assembly, timers, all at once.
    world.spawnDish('nasi-goreng');
    playScript(
      world,
      [
        [0.5, station('nasi')],
        [0.6, plate],
        [1.0, station('telur')],
        [1.2, wok],
        [2.0, station('sayur')],
        [2.2, board],
        [2.6, board],
      ],
      9,
    );
    state.time = 62;
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'serve') {
    // Finish a Nasi Goreng exactly: nasi, a fried telur and sambal on the
    // plate, the matching order still on the board, SERVE glowing.
    world.spawnDish('nasi-goreng');
    playScript(
      world,
      [
        [0.5, station('nasi')],
        [0.6, plate],
        [1.0, station('telur')],
        [1.2, wok],
        [5.4, wok],
        [5.6, plate],
        [5.8, station('sambal')],
        [6.0, plate],
      ],
      6.5,
    );
    state.time = 41;
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'end') {
    // A shift played out: a couple of real serves, then the clock runs down.
    world.spawnDish('nasi-goreng');
    playScript(
      world,
      [
        [0.5, station('nasi')],
        [0.9, plate],
        [1.3, station('telur')],
        [1.7, wok],
        [6.0, wok],
        [6.4, plate],
        [6.8, station('sambal')],
        [7.2, plate],
        [7.6, serve],
      ],
      9,
    );
    state.time = 150;
    state.coins = Math.max(state.coins, 46);
    state.served = Math.max(state.served, 3);
    state.bestCombo = Math.max(state.bestCombo, 3);
    state.expired = 1;
    state.hearts = 2;
    return { screen: SCREEN_OVER, best: 52 };
  }
  // start: a quiet kitchen behind the title, one order already waiting.
  playScript(world, [], 5);
  world.spawnOrder();
  state.orders[0].timeLeft = 44;
  return { screen: SCREEN_TITLE, best: 0 };
}
