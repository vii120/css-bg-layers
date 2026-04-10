// Matches hex colors and CSS functional color notations (rgb, hsl, oklch, etc.)
const COLOR_RE =
  /(?:#[0-9a-fA-F]{3,8}|(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\s*\([^)]+\))/gi

export interface ColorToken {
  start: number
  end: number
  raw: string
}

/** Finds all color tokens in a CSS value string, with their positions. */
export function parseColorTokens(text: string): ColorToken[] {
  const tokens: ColorToken[] = []
  const re = new RegExp(COLOR_RE.source, 'gi')
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    tokens.push({ start: m.index, end: m.index + m[0].length, raw: m[0] })
  }
  return tokens
}

/**
 * Resolves any CSS color string to a hex value.
 * Returns 8-char hex (`#rrggbbaa`) when alpha < 1, 6-char otherwise.
 * Pass `stripAlpha: true` to always return 6-char (e.g. for display swatches).
 *
 * Uses the browser's style resolution for non-hex inputs (rgb, hsl, etc.).
 */
export function cssColorToHex(color: string, stripAlpha = false): string {
  if (color.startsWith('#')) {
    let h = color.slice(1)
    // Expand shorthand: #rgb → #rrggbb, #rgba → #rrggbbaa
    if (h.length === 3 || h.length === 4)
      h = h
        .split('')
        .map((c) => c + c)
        .join('')
    return stripAlpha
      ? `#${h.slice(0, 6).toLowerCase()}`
      : `#${h.slice(0, 8).toLowerCase()}`
  }

  try {
    const el = document.createElement('div')
    el.style.color = color
    document.body.appendChild(el)
    const resolved = getComputedStyle(el).color
    document.body.removeChild(el)

    // getComputedStyle returns "rgb(r, g, b)" or "rgba(r, g, b, a)"
    const nums = resolved.match(/[\d.]+/g)
    if (nums && nums.length >= 3) {
      const [r, g, b] = nums
        .slice(0, 3)
        .map((n) => Number(n).toString(16).padStart(2, '0'))
      if (!stripAlpha && nums.length >= 4 && Number(nums[3]) < 1) {
        const a = Math.round(Number(nums[3]) * 255)
          .toString(16)
          .padStart(2, '0')
        return `#${r}${g}${b}${a}`
      }
      return `#${r}${g}${b}`
    }
  } catch {}

  return '#000000'
}
