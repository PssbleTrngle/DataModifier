export type TagEntry =
   | string
   | Readonly<{
        required?: boolean
        id: string
     }>

export type TagDefinition = Readonly<{
   replace?: boolean
   values: TagEntry[]
}>
