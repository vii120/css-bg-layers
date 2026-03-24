/**
 * Split a CSS value string at top-level commas only
 * (ignores commas inside parentheses, e.g. var(--x, fallback), rgba(...))
 */
export function splitTopLevelCommas(value: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0

  for (let i = 0; i < value.length; i++) {
    const ch = value[i]
    if (ch === '(') depth++
    else if (ch === ')') depth--
    else if (ch === ',' && depth === 0) {
      parts.push(value.slice(start, i).trim())
      start = i + 1
    }
  }

  const last = value.slice(start).trim()
  if (last) parts.push(last)
  return parts
}

/**
 * Extract CSS declarations from input — strips optional curly braces.
 * Handles `div { ... }` or bare declarations.
 */
export function extractDeclarations(input: string): string {
  const trimmed = input.trim()
  const braceMatch = trimmed.match(/\{([\s\S]*)\}/)
  if (braceMatch) return braceMatch[1].trim()
  return trimmed
}

/**
 * Parse CSS declaration block into a property map.
 * Skips CSS custom properties (--foo: bar).
 * Handles multi-line values by joining them before splitting on `;`.
 */
function parseDeclarations(declarations: string): Record<string, string> {
  const props: Record<string, string> = {}

  // Strip CSS comments before parsing so inline comments (e.g. `--s: 20px; /* note */\n background:`)
  // don't bleed into the next property name.
  const cleaned = declarations.replace(/\/\*[\s\S]*?\*\//g, '')

  // Split on semicolons. Values can span multiple lines but don't contain semicolons
  // (edge case: content property — not relevant here)
  const lines = cleaned.split(';')

  for (const line of lines) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue

    const prop = line.slice(0, colonIdx).trim().toLowerCase()
    // Normalize whitespace in value (collapse newlines/tabs to single space)
    const value = line.slice(colonIdx + 1).replace(/\s+/g, ' ').trim()

    if (!prop || !value) continue
    // Skip CSS custom properties
    if (prop.startsWith('--')) continue

    props[prop] = value
  }

  return props
}

export type LayerType
  = 'linear-gradient'
  | 'radial-gradient'
  | 'conic-gradient'
  | 'repeating-linear-gradient'
  | 'repeating-radial-gradient'
  | 'repeating-conic-gradient'
  | 'image'
  | 'none'
  | 'unknown'

export interface BgLayer {
  index: number
  /** The raw layer value (full string for this layer) */
  raw: string
  type: LayerType
  /** For separate-property inputs, these are correlated per-layer */
  position?: string
  size?: string
  repeat?: string
  attachment?: string
  origin?: string
  clip?: string
  blendMode?: string
  /** Background color — only populated on the last (bottom) layer */
  color?: string
}

export function detectLayerType(value: string): LayerType {
  // Scan past leading position/color tokens to find the image function
  // For simple cases, just look for the first '(' to find the function name
  const fnMatch = value.match(/([a-z-]+)\s*\(/)
  if (fnMatch) {
    const fn = fnMatch[1].toLowerCase()
    if (fn === 'linear-gradient') return 'linear-gradient'
    if (fn === 'radial-gradient') return 'radial-gradient'
    if (fn === 'conic-gradient') return 'conic-gradient'
    if (fn === 'repeating-linear-gradient') return 'repeating-linear-gradient'
    if (fn === 'repeating-radial-gradient') return 'repeating-radial-gradient'
    if (fn === 'repeating-conic-gradient') return 'repeating-conic-gradient'
    if (fn === 'url' || fn === 'image' || fn === 'image-set' || fn === 'cross-fade') return 'image'
  }

  const v = value.trim().toLowerCase()
  if (v === 'none') return 'none'

  return 'unknown'
}

/** Human-readable label for a layer type */
export function layerTypeLabel(type: LayerType): string {
  switch (type) {
    case 'linear-gradient': return 'linear'
    case 'radial-gradient': return 'radial'
    case 'conic-gradient': return 'conic'
    case 'repeating-linear-gradient': return 'rep. linear'
    case 'repeating-radial-gradient': return 'rep. radial'
    case 'repeating-conic-gradient': return 'rep. conic'
    case 'image': return 'image'
    case 'none': return 'none'
    default: return 'layer'
  }
}

/**
 * Returns true if the string contains a space character outside of parentheses.
 */
function hasTopLevelSpace(value: string): boolean {
  let depth = 0
  for (const ch of value) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    else if (ch === ' ' && depth === 0) return true
  }
  return false
}

/**
 * Returns true if the token looks like a CSS color value:
 * - Hex notation (#rgb, #rrggbb, etc.)
 * - Color functions (rgb, hsl, oklch, etc.) or var() which most commonly
 *   carries a color when appearing as a single trailing token on the last layer.
 */
function looksLikeColor(token: string): boolean {
  const t = token.trim()
  if (t.startsWith('#')) return true
  const fn = t.match(/^([a-z-]+)\s*\(/)?.[1]
  if (fn) {
    return [
      'rgb', 'rgba', 'hsl', 'hsla', 'hwb',
      'oklch', 'oklab', 'lab', 'lch',
      'color', 'color-mix', 'light-dark', 'var',
    ].includes(fn)
  }
  // Named colors that are not position keywords and have no parens/spaces.
  // Position keywords: left, right, top, bottom, center.
  const posKeywords = new Set(['left', 'right', 'top', 'bottom', 'center'])
  const lower = t.toLowerCase()
  if (/^[a-z]+$/.test(lower) && !posKeywords.has(lower)) return true
  return false
}

/**
 * Split a shorthand layer value into the image function and any trailing tokens
 * (position, size, repeat, etc. that follow the closing paren of the image function).
 * Tracks parenthesis depth from the first '(' to find the matching closing paren,
 * so layers like `var(--g1) var(--s) calc(1.73*var(--s))` are split correctly.
 */
function splitLayerImageAndTrailing(raw: string): { imageValue: string; trailing: string } {
  const firstParen = raw.indexOf('(')
  if (firstParen === -1) {
    return { imageValue: raw, trailing: '' }
  }

  let depth = 0
  for (let i = firstParen; i < raw.length; i++) {
    if (raw[i] === '(') depth++
    else if (raw[i] === ')') {
      depth--
      if (depth === 0) {
        const trailing = raw.slice(i + 1).trim()
        return {
          imageValue: raw.slice(0, i + 1).trim(),
          trailing,
        }
      }
    }
  }

  return { imageValue: raw, trailing: '' }
}

/**
 * Parse CSS input into an ordered array of background layers (top → bottom).
 * Returns null if no background-related properties are found.
 */
const cycle = <T,>(arr: T[], i: number): T | undefined =>
  arr.length > 0 ? arr[i % arr.length] : undefined

export function parseCssInput(input: string): BgLayer[] | null {
  if (!input.trim()) return null

  const declarations = extractDeclarations(input)
  const props = parseDeclarations(declarations)

  const bgShorthand = props['background']
  const bgImage = props['background-image']
  const bgColor = props['background-color']
  const bgPosition = props['background-position']
  const bgSize = props['background-size']
  const bgRepeat = props['background-repeat']
  const bgAttachment = props['background-attachment']
  const bgOrigin = props['background-origin']
  const bgClip = props['background-clip']
  const bgBlendMode = props['background-blend-mode']

  if (!bgShorthand && !bgImage && !bgColor) return null

  if (bgShorthand) {
    // background shorthand: each comma-separated segment is a full layer.
    // Also pick up any separate background-* properties that supplement the shorthand
    // (e.g. `background-size` declared alongside a `background:` shorthand).
    const layers = splitTopLevelCommas(bgShorthand)
    const count = layers.length

    const positions = bgPosition ? splitTopLevelCommas(bgPosition) : []
    const sizes = bgSize ? splitTopLevelCommas(bgSize) : []
    const repeats = bgRepeat ? splitTopLevelCommas(bgRepeat) : []
    const attachments = bgAttachment ? splitTopLevelCommas(bgAttachment) : []
    const origins = bgOrigin ? splitTopLevelCommas(bgOrigin) : []
    const clips = bgClip ? splitTopLevelCommas(bgClip) : []
    const blendModes = bgBlendMode ? splitTopLevelCommas(bgBlendMode) : []

    // When supplementary background-* properties are declared alongside the shorthand,
    // the raw layer string may contain embedded position tokens (e.g. `gradient(...) 25px 25px`).
    // Split them out so reconstruction doesn't duplicate position/size data.
    // blend-mode is excluded: it's not part of the `background` shorthand so it can't
    // appear as an embedded trailing token in a layer value.
    const hasSuppProps = [bgPosition, bgSize, bgRepeat, bgAttachment, bgOrigin, bgClip].some(Boolean)

    return layers.map((rawLayer, i) => {
      let raw = rawLayer
      let embeddedPosition: string | undefined

      if (hasSuppProps) {
        const { imageValue, trailing } = splitLayerImageAndTrailing(rawLayer)
        raw = imageValue
        if (trailing) embeddedPosition = trailing
      }

      // For the last layer: if there's no explicit separate position and the
      // embedded trailing is a single color-like token (no top-level spaces),
      // treat it as the background-color rather than a position. This handles
      // patterns like `gradient(...) var(--c)` or `gradient(...) #hex` alongside
      // a supplementary `background-size`, where putting the color before `/size`
      // would produce invalid CSS.
      let resolvedColor = i === count - 1 ? bgColor : undefined
      if (
        i === count - 1 &&
        !cycle(positions, i) &&
        embeddedPosition &&
        !hasTopLevelSpace(embeddedPosition) &&
        looksLikeColor(embeddedPosition)
      ) {
        resolvedColor = embeddedPosition
        embeddedPosition = undefined
      }

      return {
        index: i,
        raw,
        type: detectLayerType(raw),
        position: cycle(positions, i) ?? embeddedPosition,
        size: cycle(sizes, i),
        repeat: cycle(repeats, i),
        attachment: cycle(attachments, i),
        origin: cycle(origins, i),
        clip: cycle(clips, i),
        blendMode: cycle(blendModes, i),
        color: resolvedColor,
      }
    })
  }

  // Separate background-* properties
  const images = bgImage ? splitTopLevelCommas(bgImage) : ['none']
  const count = images.length

  const positions = bgPosition ? splitTopLevelCommas(bgPosition) : []
  const sizes = bgSize ? splitTopLevelCommas(bgSize) : []
  const repeats = bgRepeat ? splitTopLevelCommas(bgRepeat) : []
  const attachments = bgAttachment ? splitTopLevelCommas(bgAttachment) : []
  const origins = bgOrigin ? splitTopLevelCommas(bgOrigin) : []
  const clips = bgClip ? splitTopLevelCommas(bgClip) : []
  const blendModes = bgBlendMode ? splitTopLevelCommas(bgBlendMode) : []

  return images.map((image, i) => ({
    index: i,
    raw: image,
    type: detectLayerType(image),
    position: cycle(positions, i),
    size: cycle(sizes, i),
    repeat: cycle(repeats, i),
    attachment: cycle(attachments, i),
    origin: cycle(origins, i),
    clip: cycle(clips, i),
    blendMode: cycle(blendModes, i),
    color: i === count - 1 ? bgColor : undefined,
  }))
}

/**
 * Reconstruct a background shorthand value from parsed layers.
 * For shorthand-parsed layers, returns the original raw values joined by comma.
 * For separately-parsed layers, builds a shorthand per layer.
 */
export function reconstructBackground(layers: BgLayer[]): string {
  return layers.map((l) => {
    const parts: string[] = [l.raw]
    if (l.position || l.size) {
      // `/ size` must follow a position in the shorthand; fall back to 0% 0% if unset
      const pos = l.position ?? '0% 0%'
      parts.push(l.size ? `${pos} / ${l.size}` : pos)
    }
    if (l.repeat) parts.push(l.repeat)
    if (l.attachment) parts.push(l.attachment)
    if (l.origin) parts.push(l.origin)
    if (l.clip) parts.push(l.clip)
    if (l.color) parts.push(l.color)
    return parts.join(' ')
  }).join(',\n  ')
}
