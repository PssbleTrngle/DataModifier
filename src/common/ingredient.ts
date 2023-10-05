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
type CommonTest<T> = RegExp | Predicate<T>
export type IngredientTest = CommonTest<Ingredient> | ItemId | ItemTagId

export function resolveIngredientTest(test: IngredientTest, itemTags: TagRegistry): (value: Ingredient) => boolean {
   return ingredient => {
      if (typeof test === 'function') {
         return test(ingredient)
      } else if (typeof test === 'string') {
         if (test.startsWith('#')) {
            if ('item' in ingredient) return itemTags.contains(test, ingredient.item)
            if ('tag' in ingredient) return test === ingredient.tag
            // TODO fluid
            return false
         } else {
            if ('item' in ingredient) return test === ingredient.item
         }
      } else if ('item' in ingredient) {
         return test.test(ingredient.item)
      }

      return false
   }
}
