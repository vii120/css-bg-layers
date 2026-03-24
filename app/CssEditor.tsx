'use client'

import { css } from '@codemirror/lang-css'
import { syntaxHighlighting } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { placeholder as cmPlaceholder } from '@codemirror/view'
import { EditorView, minimalSetup } from 'codemirror'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { baseEditorTheme, highlightStyle } from '@/lib/cmTheme'

const editorTheme = EditorView.theme(
  {
    '&': {
      height: '100%',
      fontSize: '13px',
      fontFamily: 'var(--font-geist-mono), monospace',
    },
    '.cm-content': {
      padding: '1rem',
    },
    '.cm-focused .cm-cursor': {
      borderLeftColor: '#3b52d4',
    },
    '.cm-placeholder': {
      color: '#b0a89e',
      fontStyle: 'normal',
    },
  },
  { dark: false },
)

export interface CssEditorHandle {
  focus: () => void
}

export const CssEditor = forwardRef<
  CssEditorHandle,
  {
    value: string
    onChange: (v: string) => void
    placeholder?: string
    className?: string
    style?: React.CSSProperties
  }
>(({ value, onChange, placeholder, className, style }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useImperativeHandle(ref, () => ({
    focus: () => viewRef.current?.focus(),
  }))

  useEffect(() => {
    if (!containerRef.current) return

    const extensions = [
      minimalSetup,
      css(),
      baseEditorTheme,
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
})
