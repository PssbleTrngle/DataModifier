export type ForgeCondition = Readonly<{
   type: string
   [key: string]: unknown
}>
export type FabricCondition = Readonly<{
   condition: string
   [key: string]: unknown
}>

export type RecipeDefinition = Readonly<{
   type: string
   conditions?: ForgeCondition[]
   'fabric:load_conditions'?: FabricCondition[]
}>
