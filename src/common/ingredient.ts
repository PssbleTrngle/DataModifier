import { TagRegistry, TagRegistryHolder } from '../loader/tags.js'
import { createId, encodeId, Id, NormalizedId } from './id.js'
import { Logger } from '../logger.js'
import { resolveCommonTest } from './predicates.js'
import { Block, createResult, FluidStack, ItemStack } from './result.js'
import zod from 'zod'
import { exists } from '@pssbletrngle/pack-resolver'
import { IllegalShapeError, tryCatching } from '../error.js'
import { RegistryLookup } from '../loader/registryDump.js'

export const ItemTagSchema = zod.object({
   tag: zod.string(),
   count: zod.number().optional(),
})

export type ItemTag = zod.infer<typeof ItemTagSchema>

export const FluidTagSchema = zod.object({
   fluidTag: zod.string(),
   amount: zod.number().optional(),
})

export type FluidTag = zod.infer<typeof FluidTagSchema>

export const BlockTagSchema = zod.object({
   blockTag: zod.string(),
   weight: zod.number().optional(),
})

export type BlockTag = zod.infer<typeof BlockTagSchema>

export type ItemIngredient = ItemStack | ItemTag
export type FluidIngredient = FluidStack | FluidTag
export type BlockIngredient = Block | BlockTag

export type Ingredient = ItemIngredient | FluidIngredient | BlockIngredient | Ingredient[]
export type IngredientInput = Ingredient | string | IngredientInput[]

function createUnvalidatedIngredient(input: unknown, lookup?: RegistryLookup): Ingredient {
   if (!input) throw new IllegalShapeError('ingredient input may not be null')

   if (typeof input === 'string') {
      if (input.startsWith('#')) return { tag: input.substring(1) }
      else return { item: input }
   }

   if (Array.isArray(input)) {
      return input.map(it => createIngredient(it, lookup))
   }

   if (typeof input === 'object') {
      if ('tag' in input) return ItemTagSchema.parse(input)
      if ('fluidTag' in input) return FluidTagSchema.parse(input)
      if ('blockTag' in input) return BlockTagSchema.parse(input)

      return createResult(input, lookup)
   }

   throw new IllegalShapeError('unknown ingredient shape', input)
}

export function createIngredient(input: unknown, lookup?: RegistryLookup): Ingredient {
   const unvalidated = createUnvalidatedIngredient(input, lookup)
   lookup?.validate(unvalidated)
   return unvalidated
}

export type Predicate<T> = (value: T, logger?: Logger) => boolean
export type CommonTest<T> = RegExp | Predicate<T> | T
export type IngredientTest = CommonTest<Ingredient> | NormalizedId

export function resolveIdIngredientTest(
   test: NormalizedId | RegExp,
   tags: TagRegistry,
   idSupplier: (it: Ingredient) => Id | null
): Predicate<IngredientInput> {
   function resolveIds(it: IngredientInput): Id[] {
      if (Array.isArray(it)) {
         return it.flatMap(resolveIds)
      } else {
         return [idSupplier(createIngredient(it))].filter(exists)
      }
   }

   return resolveCommonTest(
      test,
      (input, logger) =>
         tryCatching(logger, () => {
            return resolveIds(input).map(encodeId)
         }) ?? [],
      tags
   )
}

function extractItemID(ingredient: Ingredient): Id | null {
   if ('tag' in ingredient) return { ...createId(ingredient.tag), isTag: true }
   if ('item' in ingredient) return createId(ingredient.item)
   return null
}

function extractFluidID(ingredient: Ingredient): Id | null {
   if ('fluidTag' in ingredient) return { ...createId(ingredient.fluidTag), isTag: true }
   if ('fluid' in ingredient) return createId(ingredient.fluid)
   return null
}

function extractBlockID(ingredient: Ingredient): Id | null {
   if ('blockTag' in ingredient) return { ...createId(ingredient.blockTag), isTag: true }
   if ('block' in ingredient) return createId(ingredient.block)
   return null
}

export function resolveIngredientTest(test: IngredientTest, tags: TagRegistryHolder): Predicate<IngredientInput> {
   if (typeof test === 'string' || test instanceof RegExp) {
      return resolveIdIngredientTest(test, tags.registry('items'), extractItemID)
   }

   if (typeof test === 'function') {
      return (it, logger) => test(createIngredient(it), logger)
   }

   if ('tag' in test) return resolveIdIngredientTest(`#${encodeId(test.tag)}`, tags.registry('items'), extractItemID)
   if ('item' in test) return resolveIdIngredientTest(encodeId(test.item), tags.registry('items'), extractItemID)
   if ('fluidTag' in test)
      return resolveIdIngredientTest(`#${encodeId(test.fluidTag)}`, tags.registry('fluids'), extractFluidID)
   if ('fluid' in test) return resolveIdIngredientTest(encodeId(test.fluid), tags.registry('fluids'), extractFluidID)
   if ('blockTag' in test)
      return resolveIdIngredientTest(`#${encodeId(test.blockTag)}`, tags.registry('blocks'), extractBlockID)
   if ('block' in test) return resolveIdIngredientTest(encodeId(test.block), tags.registry('blocks'), extractBlockID)

   return () => false
}
