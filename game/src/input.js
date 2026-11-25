// Mouse and keyboard input: clicks land on the kitchen's rectangles, keys
// mirror them (1-6 pick a station, C chops, F works the wok, S serves,
// T clears the plate, P pauses, Space/Enter confirms). The loop pulls
// actions out with takeActions(); pointer moves are tracked for hover.
import { INGREDIENTS, LAYOUT } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;

function inside(rect, x, y) {
  return x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
}

export function stationRect(index) {
  const s = LAYOUT.stations;
  const tile = LAYOUT.station;
  return { x: s.x + index * (tile.w + LAYOUT.station.gap), y: s.y, w: tile.w, h: tile.h };
}

/** Which kitchen zone a point (in logical 1280x720 coordinates) falls in. */
export function zoneAt(x, y) {
  for (let i = 0; i < INGREDIENTS.length; i += 1) {
    if (inside(stationRect(i), x, y)) return { zone: 'station', id: INGREDIENTS[i].id };
  }
  if (inside(LAYOUT.board, x, y)) return { zone: 'board' };
  if (inside(LAYOUT.plate, x, y)) return { zone: 'plate' };
  if (inside(LAYOUT.wok, x, y)) return { zone: 'wok' };
  if (inside(LAYOUT.serve, x, y)) return { zone: 'serve' };
  if (inside(LAYOUT.trash, x, y)) return { zone: 'trash' };
  return null;
}

export function createInput(canvas) {
  const actions = [];
  let flags = 0;
  const hover = { x: -1, y: -1 };

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 720,
    };
  }

  canvas.addEventListener('pointermove', (event) => {
    const p = toLogical(event);
    hover.x = p.x;
    hover.y = p.y;
  });

  canvas.addEventListener('pointerdown', (event) => {
    const p = toLogical(event);
    const zone = zoneAt(p.x, p.y);
    if (zone) actions.push(zone);
    else actions.push({ zone: 'confirm' });
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    const ingredient = INGREDIENTS.find((item) => item.key === key);
    if (ingredient) {
      actions.push({ zone: 'station', id: ingredient.id });
      return;
    }
    if (key === 'c') actions.push({ zone: 'board' });
    else if (key === 'f') actions.push({ zone: 'wok' });
    else if (key === 's' || key === ' ') {
      event.preventDefault();
      actions.push({ zone: 'serve' });
    } else if (key === 't') actions.push({ zone: 'trash' });
    else if (key === 'enter') flags |= ACTION_CONFIRM;
    else if (key === 'p' || key === 'escape') flags |= ACTION_PAUSE;
  });

  return {
    hover,
    takeActions() {
      return actions.splice(0, actions.length);
    },
    takeFlags() {
      const value = flags;
      flags = 0;
      return value;
    },
  };
}
