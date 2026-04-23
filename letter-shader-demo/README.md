# Letter Shader

A standalone, drop-in demo that recreates the animated gradient effect from
[ui-shader.vercel.app](https://ui-shader.vercel.app) — but rendered entirely
with **letters** using the [pretext](https://github.com/chenglou/pretext) text
measurement library.

No React. No WebGL. Just `prepareWithSegments()` from pretext, a density
field, and a few hundred lines of plain JavaScript.

## Preview

A flowing ribbon shader drawn with variable-weight Georgia glyphs. Each cell
picks a letter whose painted brightness matches the field, and colors it by
interpolating a 4-stop palette along the ribbon.

## Controls

- **Palette** — Prism / Lagoon / Ember / Aurora (the ui-shader palettes)
- **Speed** — 0.15× – 5×
- **Playback** — pause/resume

## Files

```
letter-shader-demo/
├── index.html          — markup and HUD
├── letter-shader.css   — styling
├── letter-shader.js    — shader field + render loop
├── pretext.js          — bundled pretext library
├── LICENSE             — MIT
└── README.md
```

Four plain files plus the license. Nothing to install. Nothing to build.

## Running

Any static file server works. A few options:

```sh
# Bun
bunx serve letter-shader-demo

# Python
python3 -m http.server -d letter-shader-demo 8080

# Node
npx http-server letter-shader-demo
```

Then open the printed `http://localhost:...` URL.

> Opening `index.html` directly via `file://` will not work — browsers block
> ES-module imports over the `file:` protocol. Use any of the commands above.

## How it works

1. **Glyph palette** — at startup, every `(char × weight × style)`
   combination in the character set is measured by pretext
   (`prepareWithSegments`) for exact width, and painted to a tiny offscreen
   canvas to estimate brightness. The result is a sorted table of glyphs
   indexed by brightness.

2. **Shader field** — each frame, each grid cell samples a field built from
   the same `sin`/`cos`/gaussian math as the original WebGL fragment shader:
   a curved ribbon with four gaussian color bands along its thickness.

3. **Per-cell letter pick** — the field returns `{ density, t }`. Density
   drives a binary search into the glyph table (with a nearby refinement for
   width matching); `t` interpolates the current palette.

4. **Draw** — each row is rendered as one `<div>` with per-cell
   `<span style="color:...">` runs, re-written every frame.

No canvas pixels are drawn for the visible frame; everything you see is real
DOM text, laid out by the browser and horizontally measured by pretext.

## License

MIT — see [LICENSE](./LICENSE). `pretext.js` is also MIT-licensed and
copyright the [pretext contributors](https://github.com/chenglou/pretext).
