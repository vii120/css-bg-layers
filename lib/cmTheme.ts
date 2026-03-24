import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

export const highlightStyle = HighlightStyle.define([
  { tag: t.propertyName, color: '#c2410c' },
  { tag: t.variableName, color: '#0e7490' },
  { tag: t.keyword, color: '#7c3aed' },
  { tag: t.function(t.variableName), color: '#2563eb' },
  { tag: t.number, color: '#d97706' },
  { tag: t.unit, color: '#b45309' },
  { tag: t.string, color: '#059669' },
  { tag: t.url, color: '#059669' },
  { tag: t.color, color: '#9333ea' },
  { tag: t.comment, color: '#a8a29e', fontStyle: 'italic' },
  { tag: t.punctuation, color: '#78716c' },
  { tag: t.operator, color: '#78716c' },
])

export const cmSyntaxHighlighting = syntaxHighlighting(highlightStyle)

export const baseEditorTheme = EditorView.theme({
  '.cm-scroller': {
    fontFamily: 'var(--font-geist-mono), monospace',
    lineHeight: '1.65',
    overflow: 'auto',
  },
  '.cm-content': {
    caretColor: '#3b52d4',
  },
  '.cm-line': {
    padding: '0',
  },
  '.cm-cursor': {
    borderLeftColor: '#3b52d4',
    borderLeftWidth: '2px',
  },
  '.cm-selectionBackground': {
    background: 'rgba(59, 82, 212, 0.12) !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    background: 'rgba(59, 82, 212, 0.15) !important',
  },
  '.cm-gutters': {
    display: 'none',
  },
  '&.cm-focused': {
    outline: 'none',
  },
})
