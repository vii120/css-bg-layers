import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface CssStore {
  css: string
  setCss: (css: string) => void
}

export const useCssStore = create<CssStore>()(
  persist(
    (set) => ({
      css: '',
      setCss: (css) => set({ css }),
    }),
    {
      name: 'layer-css',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
