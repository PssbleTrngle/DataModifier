export type TagEntry =
   | string
   | {
        required?: boolean
        value: string
     }

export interface TagDefinition {
   replace?: boolean
   values: TagEntry[]
}
