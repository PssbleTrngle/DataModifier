export type BlockProperties = Readonly<{
   material?: string
   strength?: number
}>

export type BlockDefinition = Readonly<{
   type: string
   properties: BlockProperties
}>

export type CogBlockDefinition = BlockDefinition &
   Readonly<{
      large?: boolean
   }>
