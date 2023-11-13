type Variant = Readonly<{
   model?: string
   x?: number
   y?: number
   z?: number
}>

export type Blockstate = Readonly<{
   variants: Record<string, Variant>
}>
