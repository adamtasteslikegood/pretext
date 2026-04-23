import { prepareWithSegments } from "../../../src/layout.ts"

// Letter Shader: a pretext-powered reimagining of ui-shader.vercel.app.
// No React, no WebGL. prepareWithSegments() gives us per-glyph widths so
// variable-width letters can still tile into a shader-like field.

type Palette = {
  id: string
  label: string
  colors: [string, string, string, string]
}

const PALETTES: Palette[] = [
  { id: "prism",  label: "Prism",  colors: ["#fff06a", "#ff4fd8", "#7c3dff", "#2b63ff"] },
  { id: "lagoon", label: "Lagoon", colors: ["#7df9ff", "#2ec5ff", "#8ff7dc", "#6d5efc"] },
  { id: "ember",  label: "Ember",  colors: ["#ffd166", "#ff7a18", "#ff3b30", "#7a1f45"] },
  { id: "aurora", label: "Aurora", colors: ["#d8ff72", "#00d7a7", "#7df9ff", "#8e5dff"] },
]

const FONT_SIZE = 14
const LINE_HEIGHT = 17
const PROP_FAMILY = `Georgia, Palatino, "Times New Roman", serif`
const CHARSET = " .,:;!+-=*#@%&abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const WEIGHTS = [300, 500, 800] as const
const STYLES = ["normal", "italic"] as const

type Glyph = {
  char: string
  weight: (typeof WEIGHTS)[number]
  style: (typeof STYLES)[number]
  width: number
  brightness: number
}

// Estimate per-glyph brightness by painting to a tiny offscreen canvas and
// averaging the alpha channel.
const bCvs = document.createElement("canvas")
bCvs.width = bCvs.height = 28
const bCtx = bCvs.getContext("2d", { willReadFrequently: true })!
function estimateBrightness(ch: string, font: string): number {
  bCtx.clearRect(0, 0, 28, 28)
  bCtx.font = font
  bCtx.fillStyle = "#fff"
  bCtx.textBaseline = "middle"
  bCtx.fillText(ch, 1, 14)
  const d = bCtx.getImageData(0, 0, 28, 28).data
  let sum = 0
  for (let i = 3; i < d.length; i += 4) sum += d[i]!
  return sum / (255 * 784)
}

// Build the glyph palette: every (char × weight × style) combination, measured
// once via pretext for width and painted once for brightness. These are the
// "pixels" of the shader.
const glyphs: Glyph[] = []
for (const style of STYLES) {
  for (const weight of WEIGHTS) {
    const font = `${style === "italic" ? "italic " : ""}${weight} ${FONT_SIZE}px ${PROP_FAMILY}`
    for (const ch of CHARSET) {
      if (ch === " ") continue
      const p = prepareWithSegments(ch, font)
      const width = p.widths.length > 0 ? p.widths[0]! : 0
      if (width <= 0) continue
      glyphs.push({ char: ch, weight, style, width, brightness: estimateBrightness(ch, font) })
    }
  }
}
const maxB = Math.max(...glyphs.map(g => g.brightness))
if (maxB > 0) for (const g of glyphs) g.brightness /= maxB
glyphs.sort((a, b) => a.brightness - b.brightness)

const avgCharW = glyphs.reduce((s, g) => s + g.width, 0) / glyphs.length
const aspect = avgCharW / LINE_HEIGHT
const spaceW = FONT_SIZE * 0.27

function findGlyph(targetB: number, targetW: number): Glyph {
  // binary search by brightness, then refine locally by width match.
  let lo = 0, hi = glyphs.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (glyphs[mid]!.brightness < targetB) lo = mid + 1
    else hi = mid
  }
  let bestScore = Infinity
  let best = glyphs[lo]!
  const from = Math.max(0, lo - 15)
  const to = Math.min(glyphs.length, lo + 15)
  for (let i = from; i < to; i++) {
    const g = glyphs[i]!
    const score = Math.abs(g.brightness - targetB) * 2.5 + Math.abs(g.width - targetW) / targetW
    if (score < bestScore) { bestScore = score; best = g }
  }
  return best
}

function esc(c: string): string {
  if (c === "&") return "&amp;"
  if (c === "<") return "&lt;"
  if (c === ">") return "&gt;"
  return c
}
function wCls(w: number, s: string): string {
  const wc = w === 300 ? "w3" : w === 500 ? "w5" : "w8"
  return s === "italic" ? wc + " it" : wc
}

// ---------------------------------------------------------------------------
// Shader field. Mirrors the ui-shader.vercel.app gradient math: a flowing
// ribbon (upper/lower edges curved by sin waves) with four gaussian-weighted
// color bands. We return { density, t } per cell; density picks a glyph,
// t picks a palette stop.
// ---------------------------------------------------------------------------

function gauss(v: number, sigma: number): number {
  return Math.exp(-0.5 * (v * v) / Math.max(sigma * sigma, 0.0001))
}

function sampleField(cx: number, cy: number, cols: number, rows: number, time: number): { density: number; t: number } {
  const ux = cx / cols * 2 - 1
  let uy = cy / rows * 2 - 1
  uy += 0.06 * Math.sin(ux * 2.4 - time * 0.62) + 0.026 * Math.sin(ux * 6.8 + time * 0.44)

  const center =
    -0.06 +
    0.22 * Math.sin(ux * 1.18 - time * 0.46) +
    0.07 * Math.sin(ux * 3.75 + time * 0.28) +
    0.12 * Math.exp(-5.4 * (ux - 0.78) ** 2) * Math.sin(time * 0.72 + ux * 4.6) -
    0.08 * Math.exp(-6.5 * (ux + 0.62) ** 2) * Math.cos(time * 0.54 - 0.3)

  const thickness =
    0.84 +
    0.12 * Math.sin(ux * 1.6 + time * 0.18) +
    0.05 * Math.cos(ux * 4.8 - time * 0.22)

  const upper = center - thickness * (0.47 + 0.06 * Math.sin(ux * 2.9 - time * 0.24))
  const lower = center + thickness * (0.43 + 0.05 * Math.cos(ux * 2.5 + time * 0.21))
  const feather = 0.06

  // ribbon mask with soft edges
  const upperMask = smooth(upper - feather, upper + feather * 0.6, uy)
  const lowerMask = 1 - smooth(lower - feather * 0.6, lower + feather, uy)
  const surface = upperMask * lowerMask

  // sample position along the ribbon thickness for palette t
  let local = (uy - upper) / Math.max(lower - upper, 0.0001)
  local = Math.max(0, Math.min(1, local))
  const fold =
    0.11 * Math.sin(ux * 7.2 - time * 0.78 + local * 6.2) +
    0.04 * Math.sin(ux * 13.4 + time * 0.41 - local * 8.6)
  const sample = Math.max(0, Math.min(1, local + fold * 0.24))

  // Re-weight density by gaussian bands so the ribbon has luminous stripes.
  const w0 = Math.pow(gauss(sample - (0.13 + 0.04 * Math.sin(ux * 1.8 - time * 0.22)), 0.18), 1.2)
  const w1 = Math.pow(gauss(sample - (0.38 + 0.03 * Math.cos(ux * 2.6 + time * 0.19)), 0.16), 1.22)
  const w2 = Math.pow(gauss(sample - (0.64 + 0.03 * Math.sin(ux * 2.2 - time * 0.27)), 0.16), 1.18)
  const w3 = Math.pow(gauss(sample - (0.88 + 0.02 * Math.cos(ux * 2.9 + time * 0.16)), 0.15), 1.15)
  const wsum = w0 + w1 + w2 + w3
  const bandEnergy = wsum / 4

  const density = Math.max(0, Math.min(1, surface * (0.35 + 0.85 * bandEnergy)))
  return { density, t: sample }
}

function smooth(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / Math.max(b - a, 0.0001)))
  return t * t * (3 - 2 * t)
}

function lerpColor(c0: string, c1: string, t: number): string {
  const a = parseHex(c0), b = parseHex(c1)
  const r = Math.round(a[0] + (b[0] - a[0]) * t)
  const g = Math.round(a[1] + (b[1] - a[1]) * t)
  const bb = Math.round(a[2] + (b[2] - a[2]) * t)
  return "rgb(" + r + "," + g + "," + bb + ")"
}
function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  const n = parseInt(h, 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}
function paletteColor(pal: Palette, t: number, alpha: number): string {
  const stops = pal.colors
  const x = Math.max(0, Math.min(1, t)) * (stops.length - 1)
  const i = Math.min(stops.length - 2, Math.floor(x))
  const frac = x - i
  const rgb = lerpColor(stops[i]!, stops[i + 1]!, frac)
  return rgb.replace("rgb(", "rgba(").replace(")", ", " + alpha.toFixed(3) + ")")
}

// ---------------------------------------------------------------------------
// UI wiring + render loop
// ---------------------------------------------------------------------------

const stageEl = document.getElementById("stage")!
const paletteGridEl = document.getElementById("palette-grid")!
const speedInput = document.getElementById("speed") as HTMLInputElement
const speedValue = document.getElementById("speed-value")!
const playBtn = document.getElementById("play") as HTMLButtonElement
const statsEl = document.getElementById("stats")!

const state = {
  palette: PALETTES[0]!,
  speed: 1,
  paused: false,
  playhead: 0,
  lastTs: 0,
}

function buildPaletteButtons() {
  paletteGridEl.innerHTML = ""
  for (const pal of PALETTES) {
    const btn = document.createElement("button")
    btn.className = "palette-button"
    btn.type = "button"
    btn.setAttribute("aria-pressed", String(pal.id === state.palette.id))
    btn.dataset["paletteId"] = pal.id
    const sw = document.createElement("div")
    sw.className = "palette-swatches"
    for (const c of pal.colors) {
      const s = document.createElement("span")
      s.className = "palette-swatch"
      s.style.background = c
      sw.appendChild(s)
    }
    const label = document.createElement("div")
    label.className = "palette-label"
    label.textContent = pal.label
    btn.appendChild(sw)
    btn.appendChild(label)
    btn.addEventListener("click", () => {
      state.palette = pal
      for (const b of paletteGridEl.querySelectorAll(".palette-button")) {
        b.setAttribute("aria-pressed", String((b as HTMLElement).dataset["paletteId"] === pal.id))
      }
    })
    paletteGridEl.appendChild(btn)
  }
}
buildPaletteButtons()

speedInput.addEventListener("input", () => {
  state.speed = Number(speedInput.value)
  speedValue.textContent = state.speed.toFixed(2) + "×"
})
speedValue.textContent = state.speed.toFixed(2) + "×"

playBtn.addEventListener("click", () => {
  state.paused = !state.paused
  playBtn.textContent = state.paused ? "Play" : "Pause"
  playBtn.setAttribute("aria-pressed", String(state.paused))
})

// ---------------------------------------------------------------------------
// Grid: one <div.row> per text row. We resize-build only on first paint and
// resize; each frame overwrites innerHTML with a freshly-colored letter run.
// ---------------------------------------------------------------------------

const MAX_COLS = 220
const MAX_ROWS = 90
let COLS = 0
let ROWS = 0
let rowEls: HTMLDivElement[] = []

function initGrid() {
  COLS = Math.max(8, Math.min(MAX_COLS, Math.floor(window.innerWidth / avgCharW)))
  ROWS = Math.max(4, Math.min(MAX_ROWS, Math.floor(window.innerHeight / LINE_HEIGHT)))
  stageEl.innerHTML = ""
  rowEls = []
  for (let r = 0; r < ROWS; r++) {
    const d = document.createElement("div")
    d.className = "row"
    stageEl.appendChild(d)
    rowEls.push(d)
  }
}

let resizeTimer = 0
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(initGrid, 120)
})
initGrid()

let frames = 0
let fpsSince = 0
let fps = 0

function frame(now: number) {
  if (!state.paused) {
    const dt = state.lastTs ? (now - state.lastTs) / 1000 : 0
    state.playhead += dt * state.speed
  }
  state.lastTs = now

  const t = state.playhead
  const pal = state.palette

  for (let r = 0; r < ROWS; r++) {
    let html = ""
    let rowWidth = 0
    for (let c = 0; c < COLS; c++) {
      const f = sampleField(c + 0.5, r + 0.5, COLS, ROWS, t)
      if (f.density < 0.035) {
        html += " "
        rowWidth += spaceW
        continue
      }
      const targetW = aspect * LINE_HEIGHT
      const g = findGlyph(f.density, targetW)
      const alpha = Math.max(0.12, Math.min(1, f.density * 1.1))
      const color = paletteColor(pal, f.t, alpha)
      html += `<span class="${wCls(g.weight, g.style)}" style="color:${color}">${esc(g.char)}</span>`
      rowWidth += g.width
    }
    rowEls[r]!.innerHTML = html
    rowEls[r]!.style.paddingLeft = Math.max(0, (window.innerWidth - rowWidth) / 2) + "px"
  }

  frames++
  if (now - fpsSince > 500) {
    fps = Math.round(frames / ((now - fpsSince) / 1000))
    frames = 0
    fpsSince = now
    statsEl.textContent = COLS + "×" + ROWS + " · " + glyphs.length + " glyph variants · " + fps + " fps"
  }

  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
