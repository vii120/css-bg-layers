import { highlightAll } from 'microlighter'
import cssGrammar from 'microlighter/grammars/css.js'

// Stock grammar only highlights inside `selector { … }`; this app mostly shows bare
// declarations. Appended after #rule-set so `div {` still wins the tie.
cssGrammar.patterns.push({ include: '#declarations' }, { include: '#values' })

// `100%` matched as `100`: a trailing \b can't follow `%`. Boundary only for letter units.
const numeric = cssGrammar.repository.values.patterns.find(
  rule => rule.name === 'constant.numeric',
)
if (numeric)
  numeric.match = numeric.match.replace('(?:%|[a-zA-Z]+)?\\b', '(?:%|[a-zA-Z]+\\b)?')

// Document-wide: microlighter keeps one global registry and clears it on every run.
export async function highlightCss() {
  if (CSS.highlights)
    await highlightAll()
}
