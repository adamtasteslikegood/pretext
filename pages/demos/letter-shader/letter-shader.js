// letter-shader.js
import { prepareWithSegments } from "./pretext.js";

const FONT_SIZE = 12;
const LINE_HEIGHT = 12;
const PROP_FAMILY = '"Courier New", monospace';
const CHARSET =
  " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

let bCvs = document.createElement("canvas");
bCvs.width = bCvs.height = 20;
let bCtx = bCvs.getContext("2d", { willReadFrequently: true });

function estimateBrightness(ch, font) {
  bCtx.clearRect(0, 0, 20, 20);
  bCtx.font = font;
  bCtx.fillStyle = "#fff";
  bCtx.textBaseline = "middle";
  bCtx.fillText(ch, 1, 10);
  const d = bCtx.getImageData(0, 0, 20, 20).data;
  let sum = 0;
  for (let i = 3; i < d.length; i += 4) sum += d[i];
  return sum / (255 * 400);
}

let palette = [];
for (const ch of CHARSET) {
  if (ch === " ") continue;
  const font = `${FONT_SIZE}px ${PROP_FAMILY}`;
  const p = prepareWithSegments(ch, font);
  const width = p.widths.length > 0 ? p.widths[0] : 0;
  if (width <= 0) continue;
  palette.push({
    char: ch,
    font,
    width,
    brightness: estimateBrightness(ch, font),
  });
}

let maxB = Math.max(...palette.map((p) => p.brightness));
if (maxB > 0) for (const p of palette) p.brightness /= maxB;
palette.sort((a, b) => a.brightness - b.brightness);

const avgCharW = palette.reduce((s, p) => s + p.width, 0) / palette.length;

const MAX_COLS = 200;
const MAX_ROWS = 150;
let artEl = document.getElementById("art");
let statsEl = document.getElementById("stats");
let COLS = 0;
let ROWS = 0;
let lastTime = 0;

function findBest(targetB) {
  let lo = 0,
    hi = palette.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (palette[mid].brightness < targetB) lo = mid + 1;
    else hi = mid;
  }
  return palette[Math.min(lo, palette.length - 1)].char;
}

function initGrid() {
  COLS = Math.min(MAX_COLS, Math.floor(window.innerWidth / avgCharW));
  ROWS = Math.min(MAX_ROWS, Math.floor(window.innerHeight / LINE_HEIGHT));
}

initGrid();

window.addEventListener("resize", initGrid);

function gaussian1(value, sigma) {
  return Math.exp((-0.5 * (value * value)) / (sigma * sigma));
}

// Shader-inspired calculations
function getDensity(x, y, t) {
  const aspect = window.innerWidth / window.innerHeight;
  let uv = [x / COLS, y / ROWS];
  let p = [uv[0] * 2 - 1, uv[1] * 2 - 1];
  p[0] *= aspect;

  const time = t * 0.42;
  p[1] +=
    0.06 * Math.sin(p[0] * 2.4 - time * 0.62) +
    0.026 * Math.sin(p[0] * 6.8 + time * 0.44);

  p[0] +=
    aspect *
    (0.035 * Math.sin(p[1] * 2.6 + time * 0.36) +
      0.012 * Math.cos(p[1] * 6.2 - time * 0.21));

  const ux = p[0] / aspect;
  let center =
    -0.06 +
    0.22 * Math.sin(ux * 1.18 - time * 0.46) +
    0.07 * Math.sin(ux * 3.75 + time * 0.28);

  center +=
    0.12 *
    Math.exp(-5.4 * Math.pow(ux - 0.78, 2)) *
    Math.sin(time * 0.72 + ux * 4.6);
  center -=
    0.08 *
    Math.exp(-6.5 * Math.pow(ux + 0.62, 2)) *
    Math.cos(time * 0.54 - 0.3);

  let thickness =
    0.84 +
    0.12 * Math.sin(ux * 1.6 + time * 0.18) +
    0.05 * Math.cos(ux * 4.8 - time * 0.22);

  const feather = Math.max(0.0055, 2.4 / window.innerHeight);

  const upper =
    center - thickness * (0.47 + 0.06 * Math.sin(ux * 2.9 - time * 0.24));
  const lower =
    center + thickness * (0.43 + 0.05 * Math.cos(ux * 2.5 + time * 0.21));

  const surface = Math.max(0, Math.min(1, (p[1] - upper) / (lower - upper)));

  // Multiple gaussian blends for color bands
  const sample = surface;
  const w0 = Math.pow(
    gaussian1(sample - (0.13 + 0.04 * Math.sin(ux * 1.8 - time * 0.22)), 0.18),
    1.2,
  );
  const w1 = Math.pow(
    gaussian1(sample - (0.38 + 0.03 * Math.cos(ux * 2.6 + time * 0.19)), 0.16),
    1.22,
  );
  const w2 = Math.pow(
    gaussian1(sample - (0.64 + 0.03 * Math.sin(ux * 2.2 - time * 0.27)), 0.16),
    1.18,
  );
  const w3 = Math.pow(
    gaussian1(sample - (0.88 + 0.02 * Math.cos(ux * 2.9 + time * 0.16)), 0.15),
    1.15,
  );

  const total = w0 + w1 + w2 + w3;
  const normalizedDensity =
    total > 0 ? Math.min(1, ((w0 + w1 + w2 + w3) / total) * 0.98) : 0;

  return normalizedDensity;
}

function render(now) {
  const t = now / 1000;
  let html = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const density = getDensity(c, r, t);
      html += findBest(density);
    }
    html += "\n";
  }
  artEl.textContent = html;

  const fps = Math.round(1000 / (now - lastTime));
  lastTime = now;
  statsEl.textContent = `${COLS}×${ROWS} | ${fps} fps`;

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
