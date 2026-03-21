'use client'

import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { css } from '@codemirror/lang-css'
import { syntaxHighlighting } from '@codemirror/language'
import { baseEditorTheme, highlightStyle } from '@/lib/cmTheme'

const viewerTheme = EditorView.theme({
  '&': {
    fontSize: '12px',
    fontFamily: 'var(--font-geist-mono), monospace',
    background: 'transparent',
    maxHeight: '60vh',
  },
  '.cm-content': {
    padding: '0',
    caretColor: 'transparent',
  },
  '.cm-cursor': {
    display: 'none',
  },
})

export function CssViewer({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!ref.current) return

    const state = EditorState.create({
      doc: code,
      extensions: [
        css(),
        baseEditorTheme,
        viewerTheme,
        syntaxHighlighting(highlightStyle),
        EditorState.readOnly.of(true),
        EditorView.editable.of(false),
        EditorView.lineWrapping,
      ],
    })

    const view = new EditorView({ state, parent: ref.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current === code) return
    view.dispatch({
      changes: { from: 0, to: current.length, insert: code },
    })
  }, [code])

  return (
    <div
      ref={ref}
      className="bg-surface rounded-md p-4 border border-line overflow-hidden"
    />
  )
}
