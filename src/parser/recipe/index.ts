import { Ingredient, Predicate, Result } from '../../common/ingredient'
import { RecipeDefinition } from '../../schema/recipe'

export function replace<T>(from: Predicate<T>, to: T) {
   return (it: T) => {
      if (from(it)) return to
      return it
   }
}

export abstract class Recipe<TDefinition extends RecipeDefinition = RecipeDefinition> {
   constructor(protected readonly definition: TDefinition) {}

   abstract getIngredients(): Ingredient[]

   abstract replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): Recipe

   abstract getResults(): Result[]

   abstract replaceResult(from: Predicate<Ingredient>, to: Result): Recipe

   toDefinition(): TDefinition {
      return this.definition
   }
}

export default abstract class RecipeParser<TDefinition extends RecipeDefinition, TRecipe extends Recipe> {
   abstract create(definition: TDefinition): TRecipe | null
}
