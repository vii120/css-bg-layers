// npm test — node >= 22.18 (imports syntax.ts directly via type stripping).
// Both grammar patches fail silently, so nothing else would catch a regression.
import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test -- no test runner is installed; node:test is the point
import test from 'node:test'

let blocks = []

globalThis.Node = { TEXT_NODE: 3 }
globalThis.Highlight = Set
globalThis.CSS = { highlights: new Map() }
globalThis.document = { querySelectorAll: () => blocks }
globalThis.Range = class {
  setStart(node, start) {
    this.start = start
  }

  setEnd(node, end) {
    this.end = end
  }
}

// Imported after the stubs exist: highlightAll() touches these at call time.
const { highlightCss } = await import('./syntax.ts')

async function highlight(text) {
  blocks = [{
    classList: ['language-css'],
    dataset: {},
    parentElement: { classList: [], dataset: {}, getAttribute: () => null },
    firstChild: { nodeType: 3, data: text, nextSibling: null },
    normalize() {},
  }]
  CSS.highlights.clear()
  await highlightCss()

  return [...CSS.highlights].flatMap(([category, ranges]) =>
    Array.from(ranges, r => [category, text.slice(r.start, r.end)]),
  )
}

test('bare declarations highlight — the paste and View CSS case', async () => {
  const tokens = await highlight('  background: linear-gradient(180deg, #fff 0%, var(--c1));')
  assert.deepEqual(tokens.sort(), [
    ['constant', '#fff'],
    ['function', 'linear-gradient'],
    ['function', 'var'],
    ['numeric', '0%'],
    ['numeric', '180deg'],
    ['property', 'background'],
    ['variable', '--c1'],
  ].sort())
})

test('units stay attached to their number, % included', async () => {
  const tokens = await highlight('background-position: 0% 100%, 50px -20%, calc(100%/3) 1.5e3%;')
  assert.deepEqual(
    tokens.filter(([c]) => c === 'numeric').map(([, t]) => t).sort(),
    ['0%', '100%', '100%', '1.5e3%', '3', '50px', '-20%'].sort(),
  )
})

test('a selector still reads as a selector, not a declaration', async () => {
  const tokens = await highlight('div {\n  background: red;\n}')
  assert.ok(tokens.some(([c, t]) => c === 'selector' && t === 'div'))
  assert.ok(tokens.some(([c, t]) => c === 'property' && t === 'background'))
})

test('every category the grammar emits has a color in globals.css', async () => {
  const { readFileSync } = await import('node:fs')
  const globals = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
  const tokens = await highlight('/* c */\n@media screen {\n  div { background: url("a.png") 0 0 !important; }\n}')
  // `selector` inherits plain ink by design — it was unstyled before too.
  const styled = new Set(['selector', ...Array.from(globals.matchAll(/::highlight\((.+?)\)/g), m => m[1])])
  for (const [category] of tokens)
    assert.ok(styled.has(category), `::highlight(${category}) has no color rule`)
})
