export type TagEntry<T extends string = string> =
   | T
   | Readonly<{
        required?: boolean
        id: T
     }>

export type TagDefinition = Readonly<{
   replace?: boolean
   values: TagEntry[]
}>
