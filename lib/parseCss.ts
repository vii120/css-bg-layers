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

  // Split on semicolons. Values can span multiple lines but don't contain semicolons
  // (edge case: content property — not relevant here)
  const lines = declarations.split(';')

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
 * Parse CSS input into an ordered array of background layers (top → bottom).
 * Returns null if no background-related properties are found.
 */
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
    // background shorthand: each comma-separated segment is a full layer
    const layers = splitTopLevelCommas(bgShorthand)
    return layers.map((raw, i) => ({
      index: i,
      raw,
      type: detectLayerType(raw),
    }))
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
    position: positions[i],
    size: sizes[i],
    repeat: repeats[i],
    attachment: attachments[i],
    origin: origins[i],
    clip: clips[i],
    blendMode: blendModes[i],
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
    if (l.position) {
      parts.push(l.size ? `${l.position} / ${l.size}` : l.position)
    }
    if (l.repeat) parts.push(l.repeat)
    if (l.attachment) parts.push(l.attachment)
    if (l.origin) parts.push(l.origin)
    if (l.clip) parts.push(l.clip)
    if (l.color) parts.push(l.color)
    return parts.join(' ')
  }).join(',\n  ')
}
