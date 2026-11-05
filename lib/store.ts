import { create } from 'zustand'

interface CssStore {
  css: string
  setCss: (css: string) => void
}

export const useCssStore = create<CssStore>()((set) => ({
  css: '',
  setCss: (css) => set({ css }),
}))
