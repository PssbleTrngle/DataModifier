import { NormalizedId } from '../common/id'

/**
 * Can be overwritten using the cli
 */
export type RegistryId = string

/**
 * Can be overwritten using the cli
 */
export type ItemId = string

/**
 * Can be overwritten using the cli
 */
export type BlockId = string

/**
 * Can be overwritten using the cli
 */
export type FluidId = string

/**
 * Can be overwritten using the cli
 */
export type RecipeSerializerId = string

export type InferIds<T extends RegistryId> = NormalizedId<string>
