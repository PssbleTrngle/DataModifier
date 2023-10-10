import { TagRegistry, TagRegistryHolder } from '../loader/tags'
import { IdInput, NormalizedId, TagInput, encodeId } from './id'

type Item = Readonly<{ item: string }>
type ItemTag = Readonly<{ tag: string }>

type Fluid = Readonly<{ fluid: string }>
type FluidTag = Readonly<{ fluidTag: string }>

export type Ingredient = ItemTag | Item | Fluid | FluidTag

type ItemStack = Item &
   Readonly<{
      count?: number
   }>

type FluidStack = Fluid &
   Readonly<{
      amount: number
   }>

export type Result = ItemStack | FluidStack

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

export function resolveIngredientTest(test: IngredientTest, tags: TagRegistryHolder): Predicate<Ingredient> {
   if (typeof test === 'string' || test instanceof RegExp) {
      return resolveCommonTest(
         test,
         (ingredient): NormalizedId => {
            if ('tag' in ingredient) return `#${encodeId(ingredient.tag)}`
            if ('item' in ingredient) return encodeId(ingredient.item)
            return '__ignored' as NormalizedId
         },
         tags.registry('items')
      )
   } else if (typeof test === 'function') {
      return test
   } else {
      if ('tag' in test) return resolveIngredientTest(encodeId(test.tag), tags)
      if ('item' in test) return resolveIngredientTest(encodeId(test.item), tags)
      // TODO fluids
      return () => false
   }
}
