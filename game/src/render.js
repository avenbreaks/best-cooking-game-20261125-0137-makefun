// Every pixel of the kitchen: the HUD, the order board, the chopping board,
// the plate, the wok, the ingredient counter and the title/pause/shift-over
// screens. All food is drawn from shapes — no image files, no network.
import {
  DISHES,
  FIELD,
  FINISHED_NAMES,
  FONT,
  INGREDIENTS,
  LAYOUT,
  PALETTE,
  SHIFT_SECONDS,
} from './config.js';
import { stationRect } from './input.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const FOOD_COLORS = {
  nasi: '#f5f0dc',
  mie: '#f2c14e',
  ayam: '#e08a5a',
  telur: '#f7e8c8',
  sayur: '#5da24a',
  sambal: '#c0392b',
  'ayam-potong': '#d97b4f',
  'ayam-goreng': '#a0522d',
  'telur-goreng': '#f7e8c8',
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, align = 'left', weight = '700') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

/** One finished ingredient, drawn as a little dish of food. */
export function drawIngredient(ctx, id, cx, cy, size) {
  const r = size / 2;
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'nasi') {
    ctx.fillStyle = '#f5f0dc';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.15, r * 0.95, r * 0.62, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#cbb693';
    ctx.lineWidth = r * 0.08;
    ctx.stroke();
    ctx.fillStyle = '#fffdf2';
    ctx.beginPath();
    ctx.ellipse(-r * 0.2, -r * 0.25, r * 0.55, r * 0.38, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#e8ddba';
    for (const [dx, dy] of [[-0.4, 0.3], [0.1, 0.35], [0.45, 0.25], [-0.1, 0.1]]) {
      ctx.beginPath();
      ctx.arc(dx * r, dy * r, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'mie') {
    ctx.strokeStyle = '#e8a93c';
    ctx.lineWidth = r * 0.16;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(0, r * 0.1, r * (0.75 - i * 0.2), Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }
    ctx.strokeStyle = '#f7d774';
    ctx.lineWidth = r * 0.1;
    for (let i = 0; i < 2; i += 1) {
      ctx.beginPath();
      ctx.arc(0, r * 0.15, r * (0.6 - i * 0.22), Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
  } else if (id === 'ayam' || id === 'ayam-potong' || id === 'ayam-goreng') {
    ctx.fillStyle = id === 'ayam-goreng' ? '#8a4b23' : '#d97b4f';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.1, r * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = id === 'ayam-goreng' ? '#a85a2c' : '#e8a06a';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.25, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f5f0dc';
    ctx.lineWidth = r * 0.14;
    ctx.beginPath();
    ctx.moveTo(r * 0.35, r * 0.35);
    ctx.lineTo(r * 0.75, r * 0.75);
    ctx.stroke();
    ctx.fillStyle = '#f5f0dc';
    ctx.beginPath();
    ctx.arc(r * 0.82, r * 0.82, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'telur' || id === 'telur-goreng') {
    ctx.fillStyle = '#fffaf0';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r * 0.7, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d9c39a';
    ctx.lineWidth = r * 0.07;
    ctx.stroke();
    ctx.fillStyle = '#f2a93b';
    ctx.beginPath();
    ctx.arc(r * 0.05, 0, r * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7c65c';
    ctx.beginPath();
    ctx.arc(r * 0.05, 0, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'sayur') {
    ctx.fillStyle = '#5da24a';
    for (const [dx, dy, rot] of [[-0.4, 0.2, -0.6], [0.1, -0.2, 0.2], [0.45, 0.25, 0.9]]) {
      ctx.save();
      ctx.translate(dx * r, dy * r);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.42, r * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#3f7a33';
    ctx.lineWidth = r * 0.08;
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, r * 0.5);
    ctx.lineTo(r * 0.6, -r * 0.4);
    ctx.stroke();
  } else if (id === 'sambal') {
    ctx.fillStyle = '#8e2f23';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.1, r * 0.85, r * 0.5, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.05, r * 0.7, r * 0.42, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#e74c3c';
    for (const [dx, dy] of [[-0.3, -0.1], [0.15, -0.2], [0.35, 0.05]]) {
      ctx.beginPath();
      ctx.arc(dx * r, dy * r, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.fillStyle = filled ? '#e74c3c' : '#5a4636';
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.35);
  ctx.bezierCurveTo(x - size, y - size * 0.4, x - size * 0.35, y - size, x, y - size * 0.35);
  ctx.bezierCurveTo(x + size * 0.35, y - size, x + size, y - size * 0.4, x, y + size * 0.35);
  ctx.fill();
}

function drawPlate(ctx, x, y, w, h, items, glow) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.min(w, h) / 2 - 6;
  if (glow) {
    ctx.save();
    ctx.shadowColor = '#f2c14e';
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#fff7e6';
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d9c39a';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = '#e8dcc0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  const slots = [[-0.38, -0.3], [0.38, -0.3], [-0.38, 0.32], [0.38, 0.32]];
  items.forEach((id, i) => {
    if (i >= slots.length) return;
    const ix = cx + slots[i][0] * r;
    const iy = cy + slots[i][1] * r;
    ctx.fillStyle = '#f3e7c8';
    ctx.beginPath();
    ctx.arc(ix, iy, r * 0.36, 0, Math.PI * 2);
    ctx.fill();
    drawIngredient(ctx, id, ix, iy, r * 0.62);
  });
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function fit() {
    const scale = Math.min(canvas.width / FIELD.width, canvas.height / FIELD.height);
    const ox = (canvas.width - FIELD.width * scale) / 2;
    const oy = (canvas.height - FIELD.height * scale) / 2;
    ctx.setTransform(scale, 0, 0, scale, ox, oy);
  }

  function drawBackground() {
    ctx.fillStyle = PALETTE.wallTop;
    ctx.fillRect(0, 0, FIELD.width, 240);
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(0, 240, FIELD.width, 480);
    ctx.fillStyle = PALETTE.floor;
    ctx.fillRect(0, 660, FIELD.width, 60);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let x = 0; x < FIELD.width; x += 96) ctx.fillRect(x, 226, 2, 14);
    ctx.fillStyle = PALETTE.counterTop;
    ctx.fillRect(0, 452, FIELD.width, 208);
    ctx.fillStyle = PALETTE.counter;
    ctx.fillRect(0, 452, FIELD.width, 10);
  }

  function drawHud(state, screen) {
    const left = Math.max(0, Math.ceil(SHIFT_SECONDS - state.time));
    const mm = Math.floor(left / 60);
    const ss = String(left % 60).padStart(2, '0');
    ctx.fillStyle = '#241a12';
    ctx.fillRect(0, 0, FIELD.width, 56);
    text(ctx, '🍳 DAPUR KILAT', 24, 30, 26, '#f2c14e');
    const timerColor = left <= 60 ? '#ff6b5e' : '#fdf3d8';
    text(ctx, `⏱ ${mm}:${ss}`, 560, 30, 26, timerColor, 'center');
    text(ctx, `🪙 ${state.coins}`, 760, 30, 24, '#f2c14e', 'center');
    text(ctx, state.combo > 1 ? `🔥 x${state.combo}` : '🔥 —', 900, 30, 22, '#ff9a5c', 'center');
    for (let i = 0; i < 3; i += 1) drawHeart(ctx, 1020 + i * 34, 30, 13, i < state.hearts);
    text(ctx, `Tersaji ${state.served}`, 1150, 30, 18, '#cbb693', 'center', '600');
    if (screen === SCREEN_PLAY && state.rush) {
      text(ctx, 'RUSH!', 640, 84, 20, '#ff6b5e', 'center');
    }
  }

  function drawOrders(state) {
    const o = LAYOUT.orders;
    for (let i = 0; i < 3; i += 1) {
      const slot = {
        x: o.x + i * (LAYOUT.orderSlot.w + LAYOUT.orderSlot.gap),
        y: o.y,
        w: LAYOUT.orderSlot.w,
        h: LAYOUT.orderSlot.h,
      };
      const order = state.orders[i];
      ctx.fillStyle = order ? PALETTE.panel : 'rgba(255,247,230,0.25)';
      roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 10);
      ctx.fill();
      if (!order) {
        ctx.strokeStyle = 'rgba(255,247,230,0.5)';
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 2;
        roundRect(ctx, slot.x + 4, slot.y + 4, slot.w - 8, slot.h - 8, 8);
        ctx.stroke();
        ctx.setLineDash([]);
        text(ctx, 'menunggu…', slot.x + slot.w / 2, slot.y + slot.h / 2, 14, '#cbb693', 'center', '500');
        continue;
      }
      const urgent = order.timeLeft <= 12;
      ctx.strokeStyle = urgent ? '#e74c3c' : PALETTE.panelEdge;
      ctx.lineWidth = urgent ? 3 : 2;
      roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 10);
      ctx.stroke();
      text(ctx, order.dish.name, slot.x + 12, slot.y + 20, 16, PALETTE.text);
      text(ctx, `🪙 ${order.reward}`, slot.x + slot.w - 12, slot.y + 20, 15, '#b9770e', 'right');
      order.needs.forEach((need, j) => {
        const nx = slot.x + 24 + j * 44;
        const ny = slot.y + 62;
        ctx.fillStyle = need.done ? '#dff0d8' : '#f0e6cf';
        ctx.beginPath();
        ctx.arc(nx, ny, 19, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = need.done ? '#5da24a' : '#d9c39a';
        ctx.lineWidth = 2;
        ctx.stroke();
        drawIngredient(ctx, need.id, nx, ny, 28);
        if (need.done) {
          ctx.strokeStyle = '#2e8b74';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(nx - 8, ny);
          ctx.lineTo(nx - 2, ny + 7);
          ctx.lineTo(nx + 9, ny - 7);
          ctx.stroke();
        }
      });
      const frac = Math.max(0, order.timeLeft / order.maxTime);
      ctx.fillStyle = '#e8dcc0';
      roundRect(ctx, slot.x + 12, slot.y + slot.h - 18, slot.w - 24, 8, 4);
      ctx.fill();
      ctx.fillStyle = urgent ? '#e74c3c' : '#2e8b74';
      roundRect(ctx, slot.x + 12, slot.y + slot.h - 18, (slot.w - 24) * frac, 8, 4);
      ctx.fill();
      text(ctx, `${Math.ceil(order.timeLeft)} dtk`, slot.x + slot.w - 12, slot.y + slot.h - 34, 12, urgent ? '#c0392b' : PALETTE.muted, 'right', '600');
    }
  }

  function drawBoard(state) {
    const b = LAYOUT.board;
    ctx.fillStyle = '#c89b62';
    roundRect(ctx, b.x, b.y, b.w, b.h, 12);
    ctx.fill();
    ctx.fillStyle = '#dcb47e';
    roundRect(ctx, b.x + 10, b.y + 10, b.w - 20, b.h - 20, 8);
    ctx.fill();
    text(ctx, 'TALENAN — klik untuk cincang', b.x + b.w / 2, b.y + 24, 13, '#7a5230', 'center', '700');
    const item = state.board;
    if (item) {
      drawIngredient(ctx, item.id, b.x + b.w / 2, b.y + 84, 84);
      if (!item.done) {
        text(ctx, `cincang ${item.chopsLeft}x lagi`, b.x + b.w / 2, b.y + 140, 15, PALETTE.text, 'center');
        ctx.fillStyle = '#e8dcc0';
        roundRect(ctx, b.x + 40, b.y + 152, b.w - 80, 8, 4);
        ctx.fill();
        const total = INGREDIENTS.find((x) => x.id === item.id)?.chopClicks ?? 1;
        ctx.fillStyle = '#5da24a';
        roundRect(ctx, b.x + 40, b.y + 152, (b.w - 80) * (1 - item.chopsLeft / total), 8, 4);
        ctx.fill();
      } else {
        text(ctx, 'siap! klik untuk ambil', b.x + b.w / 2, b.y + 140, 15, '#2e8b74', 'center');
      }
    } else {
      ctx.strokeStyle = '#a9713f';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2, b.y + 84, 40, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'kosong', b.x + b.w / 2, b.y + 84, 14, '#a9713f', 'center', '600');
      text(ctx, 'Ayam & Sayur dicincang di sini', b.x + b.w / 2, b.y + 140, 13, '#7a5230', 'center', '500');
    }
  }

  function drawPlateArea(state, serveReady) {
    const p = LAYOUT.plate;
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    roundRect(ctx, p.x, p.y, p.w, p.h, 12);
    ctx.fill();
    text(ctx, 'PIRING SAJI', p.x + p.w / 2, p.y + 20, 13, '#f2c14e', 'center', '800');
    drawPlate(ctx, p.x + 18, p.y + 36, p.w - 36, p.h - 52, state.plate, serveReady);
    if (state.plate.length === 0) {
      text(ctx, 'klik bahan di tangan untuk merakit', p.x + p.w / 2, p.y + p.h - 12, 12, '#cbb693', 'center', '500');
    }
  }

  function drawWok(state) {
    const w = LAYOUT.wok;
    ctx.fillStyle = '#3a3f4a';
    roundRect(ctx, w.x, w.y, w.w, w.h, 12);
    ctx.fill();
    text(ctx, 'WAJAN — klik untuk menggoreng', w.x + w.w / 2, w.y + 24, 13, '#cbb693', 'center', '700');
    const cx = w.x + w.w / 2;
    const cy = w.y + 96;
    ctx.fillStyle = '#22252c';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 104, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4a505e';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 92, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#22252c';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(cx + 96, cy - 8);
    ctx.lineTo(cx + 138, cy - 30);
    ctx.stroke();
    const item = state.wok;
    if (item) {
      drawIngredient(ctx, item.id === 'ayam-potong' ? 'ayam-goreng' : item.id, cx, cy - 6, 64);
      if (!item.done) {
        const frac = Math.min(1, item.t / item.total);
        ctx.fillStyle = '#e8dcc0';
        roundRect(ctx, w.x + 40, w.y + w.h - 26, w.w - 80, 8, 4);
        ctx.fill();
        ctx.fillStyle = '#e67e22';
        roundRect(ctx, w.x + 40, w.y + w.h - 26, (w.w - 80) * frac, 8, 4);
        ctx.fill();
        text(ctx, 'menggoreng…', cx, w.y + w.h - 40, 13, '#f2c14e', 'center', '600');
      } else {
        text(ctx, 'matang! klik untuk ambil', cx, w.y + w.h - 40, 14, '#7ee2a8', 'center', '700');
      }
    } else {
      text(ctx, 'Telur & Ayam digoreng di sini', cx, cy + 4, 13, '#8b93a3', 'center', '500');
    }
  }

  function drawStations(state, hover) {
    const s = LAYOUT.stations;
    text(ctx, 'BAHAN — klik stasiun, lalu klik piring / talenan / wajan', s.x, s.y - 10, 14, '#f2c14e', 'left', '700');
    INGREDIENTS.forEach((item, i) => {
      const r = stationRect(i);
      const isHover = hover && hover.x >= r.x && hover.x < r.x + r.w && hover.y >= r.y && hover.y < r.y + r.h;
      ctx.fillStyle = isHover ? '#fff7e6' : PALETTE.panel;
      roundRect(ctx, r.x, r.y, r.w, r.h, 12);
      ctx.fill();
      ctx.strokeStyle = isHover ? '#f2c14e' : PALETTE.panelEdge;
      ctx.lineWidth = isHover ? 3 : 2;
      roundRect(ctx, r.x, r.y, r.w, r.h, 12);
      ctx.stroke();
      ctx.fillStyle = '#f3e7c8';
      ctx.beginPath();
      ctx.arc(r.x + r.w / 2, r.y + 40, 32, 0, Math.PI * 2);
      ctx.fill();
      drawIngredient(ctx, item.id, r.x + r.w / 2, r.y + 40, 56);
      text(ctx, item.name, r.x + r.w / 2, r.y + 82, 16, PALETTE.text, 'center');
      const prep = item.prep === 'instant' ? 'langsung' : item.prep === 'chop' ? 'cincang dulu' : 'goreng dulu';
      text(ctx, prep, r.x + r.w / 2, r.y + 98, 11, PALETTE.muted, 'center', '500');
      ctx.fillStyle = '#7a5230';
      ctx.beginPath();
      ctx.arc(r.x + r.w - 16, r.y + 16, 11, 0, Math.PI * 2);
      ctx.fill();
      text(ctx, item.key, r.x + r.w - 16, r.y + 17, 12, '#fdf3d8', 'center');
    });
  }

  function drawBottomBar(state, serveReady) {
    const serve = LAYOUT.serve;
    const trash = LAYOUT.trash;
    const hand = LAYOUT.hand;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    roundRect(ctx, hand.x, hand.y, hand.w, hand.h, 10);
    ctx.fill();
    if (state.hand) {
      drawIngredient(ctx, state.hand, hand.x + 34, hand.y + 32, 44);
      text(ctx, `Di tangan: ${FINISHED_NAMES[state.hand] ?? state.hand}`, hand.x + 62, hand.y + 34, 15, '#fdf3d8', 'left', '600');
    } else {
      text(ctx, 'Tangan kosong — ambil bahan', hand.x + 20, hand.y + 34, 15, '#cbb693', 'left', '500');
    }
    ctx.fillStyle = '#8e2f23';
    roundRect(ctx, trash.x, trash.y, trash.w, trash.h, 10);
    ctx.fill();
    text(ctx, '🗑 BUANG (T)', trash.x + trash.w / 2, trash.y + trash.h / 2 + 1, 15, '#fdf3d8', 'center');
    ctx.fillStyle = serveReady ? '#2e8b74' : '#5a6b62';
    if (serveReady) {
      ctx.save();
      ctx.shadowColor = '#7ee2a8';
      ctx.shadowBlur = 18;
      roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 10);
      ctx.fill();
      ctx.restore();
    } else {
      roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 10);
      ctx.fill();
    }
    text(ctx, '🍽 SAJIKAN (S)', serve.x + serve.w / 2, serve.y + serve.h / 2 + 1, 17, '#ffffff', 'center');
  }

  function drawToast(state) {
    if (state.toastIn <= 0 || !state.toast) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, state.toastIn);
    const w = ctx.measureText(state.toast).width + 48;
    ctx.fillStyle = 'rgba(36,26,18,0.92)';
    roundRect(ctx, FIELD.width / 2 - 320, 470, 640, 40, 20);
    ctx.fill();
    text(ctx, state.toast, FIELD.width / 2, 491, 16, '#fdf3d8', 'center', '600');
    ctx.restore();
  }

  function drawKitchen(state, hover) {
    const serveReady =
      state.plate.length > 0 &&
      state.orders.some((order) => {
        if (order.dish.needs.length !== state.plate.length) return false;
        return order.dish.needs.every((id) => state.plate.includes(id));
      });
    drawBackground();
    drawHud(state, SCREEN_PLAY);
    drawOrders(state);
    drawBoard(state);
    drawPlateArea(state, serveReady);
    drawWok(state);
    drawStations(state, hover);
    drawBottomBar(state, serveReady);
    drawToast(state);
  }

  function drawTitle(state, best) {
    drawKitchen(state, null);
    ctx.fillStyle = 'rgba(20,12,6,0.72)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    text(ctx, '🍳', FIELD.width / 2, 190, 90, '#ffffff', 'center');
    text(ctx, 'DAPUR KILAT', FIELD.width / 2, 290, 76, '#f2c14e', 'center', '800');
    text(ctx, 'Warung cepat saji — sajikan pesanan sebelum pelanggan pergi!', FIELD.width / 2, 350, 22, '#fdf3d8', 'center', '500');
    text(ctx, 'Klik bahan → cincang / goreng → rakit di piring → SAJIKAN', FIELD.width / 2, 392, 19, '#cbb693', 'center', '500');
    text(ctx, 'Tombol: 1–6 bahan · C cincang · F wajan · S sajikan · T buang · P jeda', FIELD.width / 2, 424, 16, '#cbb693', 'center', '500');
    ctx.fillStyle = '#2e8b74';
    roundRect(ctx, FIELD.width / 2 - 160, 470, 320, 64, 12);
    ctx.fill();
    text(ctx, '▶  MULAI SHIFT', FIELD.width / 2, 503, 24, '#ffffff', 'center');
    if (best > 0) text(ctx, `Shift terbaik: ${best} koin`, FIELD.width / 2, 570, 18, '#f2c14e', 'center', '600');
    text(ctx, '5 menu warung · 150 detik · 3 hati', FIELD.width / 2, 606, 15, '#cbb693', 'center', '500');
  }

  function drawPaused(state) {
    drawKitchen(state, null);
    ctx.fillStyle = 'rgba(20,12,6,0.7)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    text(ctx, 'JEDA', FIELD.width / 2, 320, 64, '#fdf3d8', 'center', '800');
    text(ctx, 'Tekan P atau klik untuk lanjut memasak', FIELD.width / 2, 380, 20, '#cbb693', 'center', '500');
  }

  function drawOver(state, best) {
    drawKitchen(state, null);
    ctx.fillStyle = 'rgba(20,12,6,0.78)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    const title = state.hearts <= 0 ? 'WARUNG TUTUP!' : 'SHIFT SELESAI!';
    text(ctx, title, FIELD.width / 2, 220, 60, '#f2c14e', 'center', '800');
    text(ctx, state.hearts <= 0 ? 'Tiga pelanggan pergi kecewa.' : 'Dapur kilat berhasil melewati shift!', FIELD.width / 2, 272, 20, '#fdf3d8', 'center', '500');
    ctx.fillStyle = PALETTE.panel;
    roundRect(ctx, FIELD.width / 2 - 260, 310, 520, 190, 14);
    ctx.fill();
    text(ctx, `🪙 Koin: ${state.coins}`, FIELD.width / 2, 350, 26, PALETTE.text, 'center');
    text(ctx, `🍽 Pesanan tersaji: ${state.served}`, FIELD.width / 2, 392, 20, PALETTE.text, 'center', '600');
    text(ctx, `🔥 Kombo terbaik: x${state.bestCombo}`, FIELD.width / 2, 428, 20, PALETTE.text, 'center', '600');
    text(ctx, `Pesanan hangus: ${state.expired}`, FIELD.width / 2, 464, 18, '#c0392b', 'center', '600');
    if (state.coins >= best && state.coins > 0) text(ctx, '★ Rekor baru!', FIELD.width / 2, 540, 22, '#f2c14e', 'center');
    else if (best > 0) text(ctx, `Rekor: ${best} koin`, FIELD.width / 2, 540, 18, '#cbb693', 'center', '600');
    text(ctx, 'Klik atau tekan Spasi untuk main lagi', FIELD.width / 2, 580, 17, '#fdf3d8', 'center', '500');
  }

  function draw(state, screen, best, hover) {
    fit();
    ctx.clearRect(0, 0, FIELD.width, FIELD.height);
    if (screen === SCREEN_TITLE) drawTitle(state, best);
    else if (screen === SCREEN_PAUSED) drawPaused(state);
    else if (screen === SCREEN_OVER) drawOver(state, best);
    else drawKitchen(state, hover);
  }

  return { draw, drawIngredient };
}
