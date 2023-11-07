/**
 * Can be overwritten using the cli
 */
export interface IdMap {
   [key: string]: string
}

export type RegistryId = IdMap['registry']

export type InferIds<T extends RegistryId> = IdMap[T]

export type ItemId = InferIds<'minecraft:item'>
export type BlockId = InferIds<'minecraft:block'>
export type FluidId = InferIds<'minecraft:fluid'>
export type RecipeSerializerId = InferIds<'minecraft:recipe_serializer'>
