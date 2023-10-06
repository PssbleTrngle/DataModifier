import { TagRegistry } from '../loader/tags'

type ItemId = string
type ItemTagId = string
type fluidId = string
type fluidTagId = string

type Item = Readonly<{ item: ItemId }>
type ItemTag = Readonly<{ tag: `#${ItemTagId}` }>

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

export function resolveIDTest<T extends string>(test: CommonTest<T>, tags: TagRegistry): Predicate<T> {
   if (typeof test === 'function') {
      return test
   } else if (typeof test === 'string') {
      if (test.startsWith('#')) {
         return ingredient => {
            if (ingredient.startsWith('#')) return test === ingredient
            else return tags.contains(test, ingredient)
         }
      } else {
         return ingredient => {
            return test === ingredient
         }
      }
   } else {
      return ingredient => {
         return test.test(ingredient)
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
            if ('tag' in ingredient) return test === ingredient.tag
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
