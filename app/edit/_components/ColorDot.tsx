'use client'

import Colorful from '@uiw/react-color-colorful'
import { hexToHsva, type HsvaColor } from '@uiw/color-convert'
import { useState, useMemo } from 'react'
import { cssColorToHex } from '@/lib/colorUtils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function ColorDot({
  colorStr,
  onPick,
}: {
  colorStr: string
  onPick: (hex: string) => void
}) {
  const hex = useMemo(() => cssColorToHex(colorStr, true), [colorStr])
  // Store as HSVA so the picker controls move correctly AND hue is preserved —
  // passing hex would re-derive HSV on every render, losing hue for near-grays.
  const [hsva, setHsva] = useState<HsvaColor>(() =>
    hexToHsva(cssColorToHex(colorStr)),
  )

  return (
    <Popover onOpenChange={(open) => {
      if (open) setHsva(hexToHsva(cssColorToHex(colorStr)))
    }}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          title={colorStr}
          style={{ backgroundColor: hex }}
          className="w-2.5 aspect-square rounded-[2px] border border-black/20 cursor-pointer inline-block align-middle mr-1 relative -top-px shrink-0 hover:scale-125 transition-transform duration-100"
        />
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-auto border-none shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="box-content **:box-content">
          <Colorful
            color={hsva}
            onChange={(color) => {
              setHsva(color.hsva)
              onPick(color.hexa.endsWith('ff') ? color.hex : color.hexa)
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
