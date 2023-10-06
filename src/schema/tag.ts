export type TagEntry =
   | string
   | Readonly<{
        required?: boolean
        value: string
     }>

export type TagDefinition = Readonly<{
   replace?: boolean
   values: TagEntry[]
}>
