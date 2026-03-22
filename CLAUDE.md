@AGENTS.md
@impeccable.md

## Technical Context

### Parsing Strategy (`lib/parseCss.ts`)

**No external CSS parser is used.** Everything is regex and manual string walking.

**`splitTopLevelCommas(value)`** — Splits a CSS value string at top-level commas only, tracking parenthesis depth. Correctly handles `var(--x, fallback)`, `rgba(255, 0, 0)`, and arbitrarily nested functions. Used to split both multi-layer `background-image` values and supplementary properties like `background-size`.

**`extractDeclarations(input)`** — Strips optional curly braces, accepting either a full rule block (`div { ... }`) or bare declarations.

**`parseDeclarations(declarations)`** — Splits on `;`, extracts `property: value` pairs, normalizes whitespace, lowercases property names. Skips CSS custom properties (`--foo`).

**`detectLayerType(value)`** — Finds the first CSS function name via `/([a-z-]+)\s*\(/` and maps it to a `LayerType`. Recognizes all six gradient variants, `url`/`image`/`image-set`/`cross-fade` (typed as `'image'`), and `'none'`. Returns `'unknown'` for anything else.

**`parseCssInput(input)`** — Entry point. Two modes:
- **Shorthand mode**: `background:` present — splits value by top-level commas to get layers; also picks up any co-declared `background-*` properties (e.g. a separate `background-size` alongside the shorthand).
- **Separate properties mode**: No shorthand — uses `background-image` to determine layer count (falls back to `['none']`), then correlates all other `background-*` properties.
- Both modes use a **`cycle` utility** (`arr[i % arr.length]`) to map supplementary properties to layers when counts differ — matching CSS spec cycling behavior.
- `background-color` is attached only to the last (bottom-most) layer.

**`reconstructBackground(layers)`** — Reassembles layers into a `background` shorthand string. Per-layer format: `raw [position[/size]] [repeat] [attachment] [origin] [clip] [color]`. If `size` is present but `position` is not, defaults position to `0% 0%` (required by CSS spec). Layers joined with `,\n  `.

### CSS Variables
Extracted separately via regex from the raw input, stored alongside parsed layers, and injected unchanged into preview `<style>` and output CSS. Never resolved; treated as opaque tokens.

### Input Normalization
All input is normalized to a single `background` shorthand where each comma-separated layer is self-contained. `background-color` attaches to the final layer. Layer count is driven by `background-image` layer count.

### Validation
`CSS.supports('background', value)` for shorthand input. No parse-time semantic validation — invalid values are preserved and passed through.

### Constraints
- Client-side only — no server components.
- No vendor prefix support (`-webkit-` etc. out of scope).
- No support for resolving CSS variables at runtime.
