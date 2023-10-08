import { TagRegistry } from '../loader/tags'
import { createId, encodeId, IdInput } from './id'

type ItemId = string
type ItemTagId = string
type fluidId = string
type fluidTagId = string

type Item = Readonly<{ item: ItemId }>
type ItemTag = Readonly<{ tag: ItemTagId }>

type Fluid = Readonly<{ fluid: fluidId }>
type FluidTag = Readonly<{ fluidTag: `#${fluidTagId}` }>

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
export type IngredientTest = CommonTest<Ingredient> | ItemId | ItemTagId

export function resolveIDTest<T extends string>(test: CommonTest<T>, tags?: TagRegistry): Predicate<IdInput<T>> {
   if (typeof test === 'function') {
      return id => test(encodeId<T>(id))
   } else if (typeof test === 'string') {
      if (test.startsWith('#')) {
         return ingredient => {
            const id = createId(ingredient)
            if (id.isTag) return test === encodeId(id)
            else if (tags) return tags.contains(test, ingredient) ?? false
            else throw new Error('Cannot parse ID test without tags')
         }
      } else {
         return ingredient => {
            return test === encodeId(ingredient)
         }
      }
   } else {
      return ingredient => {
         return test.test(encodeId(ingredient))
      }
   }
}

// TODO use `resolveIdTest`
export function resolveIngredientTest(test: IngredientTest, itemTags: TagRegistry): Predicate<Ingredient> {
   if (typeof test === 'function') {
      return test
   } else if (typeof test === 'string') {
      if (test.startsWith('#')) {
         return ingredient => {
            if ('item' in ingredient) return itemTags.contains(test, ingredient.item)
            if ('tag' in ingredient) return test.substring(1) === ingredient.tag
            // TODO fluid
            return false
         }
      } else {
         return ingredient => {
            if ('item' in ingredient) return test === ingredient.item
            return false
         }
      }
   } else if (test instanceof RegExp) {
      return ingredient => {
         if ('item' in ingredient) {
            return test.test(ingredient.item)
         }
         return false
      }
   } else {
      if ('tag' in test) return resolveIngredientTest(test.tag, itemTags)
      if ('item' in test) return resolveIngredientTest(test.item, itemTags)
   }

   return () => false
}
