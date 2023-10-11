import { TagRegistry, TagRegistryHolder } from '../loader/tags'
import { createId, encodeId, Id, IdInput, NormalizedId, TagInput } from './id'
import { Logger } from '../logger'

type Item = Readonly<{ item: string }>
type ItemTag = Readonly<{ tag: string }>

type Fluid = Readonly<{ fluid: string }>
type FluidTag = Readonly<{ fluidTag: string }>

export type Block = Readonly<{
   block: string
   weight?: number
}>

export type BlockTag = Readonly<{
   blockTag: string
   weight?: number
}>

export type Ingredient = ItemTag | Item | Fluid | FluidTag | Block | BlockTag
export type IngredientInput = Ingredient | string

export function createIngredient(input: IngredientInput): Ingredient {
   if (typeof input === 'string') {
      if (input.startsWith('#')) return { tag: input.substring(1) }
      else return { item: input }
   }

   return input
}

type ItemStack = Item &
   Readonly<{
      count?: number
   }>

type FluidStack = Fluid &
   Readonly<{
      amount: number
   }>

export type Result = ItemStack | FluidStack | Block
export type ResultInput = Result | string

export function createResult(input: ResultInput): Result {
   if (typeof input === 'string') return { item: input }
   return input
}

export type Predicate<T> = (value: T) => boolean
export type CommonTest<T> = RegExp | Predicate<T> | T
export type IngredientTest = CommonTest<Ingredient> | NormalizedId

export function resolveCommonTest<TEntry, TId extends string>(
   test: CommonTest<NormalizedId<TId>>,
   resolve: (value: TEntry) => NormalizedId<TId>,
   tags?: TagRegistry
): Predicate<TEntry> {
   if (typeof test === 'function') {
      return it => test(resolve(it))
   } else if (test instanceof RegExp) {
      return ingredient => {
         return test.test(resolve(ingredient))
      }
   } else if (test.startsWith('#')) {
      return ingredient => {
         const id = resolve(ingredient)
         if (id.startsWith('#') && test === id) return true
         else if (tags) return tags.contains(test as TagInput, id) ?? false
         else throw new Error('Cannot parse ID test without tags')
      }
   } else {
      return ingredient => {
         return test === resolve(ingredient)
      }
   }
}

export function resolveIDTest<T extends NormalizedId>(test: CommonTest<T>, tags?: TagRegistry): Predicate<IdInput<T>> {
   return resolveCommonTest(test, it => encodeId<T>(it), tags)
}

export function resolveIdIngredientTest(
   test: NormalizedId | RegExp,
   tags: TagRegistry,
   logger: Logger,
   idSupplier: (it: Ingredient) => Id | null
): Predicate<IngredientInput> {
   return resolveCommonTest(
      test,
      ingredient => {
         const id = idSupplier(createIngredient(ingredient))
         if (id) return encodeId(id)
         logger.warn('unknown ingredient shape:', ingredient)
         return '__ignored' as NormalizedId
      },
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

export function resolveIngredientTest(
   test: IngredientTest,
   tags: TagRegistryHolder,
   logger: Logger
): Predicate<IngredientInput> {
   if (typeof test === 'string' || test instanceof RegExp) {
      return resolveIdIngredientTest(test, tags.registry('items'), logger, extractItemID)
   }

   if (typeof test === 'function') {
      return it => test(createIngredient(it))
   }

   if ('tag' in test)
      return resolveIdIngredientTest(`#${encodeId(test.tag)}`, tags.registry('items'), logger, extractItemID)
   if ('item' in test)
      return resolveIdIngredientTest(encodeId(test.item), tags.registry('items'), logger, extractItemID)
   if ('fluidTag' in test)
      return resolveIdIngredientTest(`#${encodeId(test.fluidTag)}`, tags.registry('fluids'), logger, extractFluidID)
   if ('fluid' in test)
      return resolveIdIngredientTest(encodeId(test.fluid), tags.registry('fluids'), logger, extractFluidID)
   if ('blockTag' in test)
      return resolveIdIngredientTest(`#${encodeId(test.blockTag)}`, tags.registry('blocks'), logger, extractBlockID)
   if ('block' in test)
      return resolveIdIngredientTest(encodeId(test.block), tags.registry('blocks'), logger, extractBlockID)

   return () => false
}
