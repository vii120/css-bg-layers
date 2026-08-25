// microlighter ships no types; declare only what lib/syntax.ts uses.
declare module 'microlighter' {
  export function highlightAll(): Promise<HTMLElement[]>
}

declare module 'microlighter/grammars/css.js' {
  const grammar: {
    patterns: { include: string }[]
    repository: { values: { patterns: { name?: string, match: string }[] } }
  }
  export default grammar
}
