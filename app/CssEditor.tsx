'use client'

import { useEffect, useRef } from 'react'
import { EditorView, minimalSetup } from 'codemirror'
import { placeholder as cmPlaceholder } from '@codemirror/view'
import { css } from '@codemirror/lang-css'
import { EditorState } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

const highlightStyle = HighlightStyle.define([
  { tag: t.propertyName, color: '#c2410c' },          // terracotta — property names
  { tag: t.variableName, color: '#0e7490' },           // teal — CSS custom props (--foo)
  { tag: t.keyword, color: '#7c3aed' },                // violet — at-rules, value keywords
  { tag: t.function(t.variableName), color: '#2563eb' }, // blue — gradient/var/calc functions
  { tag: t.number, color: '#d97706' },                 // amber — numbers
  { tag: t.unit, color: '#b45309' },                   // dark amber — units (px, deg, %)
  { tag: t.string, color: '#059669' },                 // green — strings
  { tag: t.url, color: '#059669' },                    // green — url()
  { tag: t.color, color: '#9333ea' },                  // vivid violet — hex colors
  { tag: t.comment, color: '#a8a29e', fontStyle: 'italic' },
  { tag: t.punctuation, color: '#78716c' },
  { tag: t.operator, color: '#78716c' },
])

const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '13px',
    fontFamily: 'var(--font-geist-mono), monospace',
  },
  '.cm-scroller': {
    fontFamily: 'inherit',
    lineHeight: '1.65',
    overflow: 'auto',
  },
  '.cm-content': {
    padding: '1rem',
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
  '.cm-focused .cm-cursor': {
    borderLeftColor: '#3b52d4',
  },
  '.cm-gutters': {
    display: 'none',
  },
  '.cm-placeholder': {
    color: '#b0a89e',
    fontStyle: 'normal',
  },
  '&.cm-focused': {
    outline: 'none',
  },
})

export function CssEditor({
  value,
  onChange,
  placeholder,
  className,
  style,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  style?: React.CSSProperties
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const extensions = [
      minimalSetup,
      css(),
      editorTheme,
      syntaxHighlighting(highlightStyle),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString())
        }
      }),
      EditorView.lineWrapping,
      ...(placeholder ? [cmPlaceholder(placeholder)] : []),
    ]

    const state = EditorState.create({ doc: value, extensions })
    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync external value changes (e.g. clicking an example card)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    if (view.state.doc.toString() === value) return
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
    })
  }, [value])

  return <div ref={containerRef} className={className} style={style} />
}
