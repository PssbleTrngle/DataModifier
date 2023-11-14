import { Ingredient, IngredientInput, Predicate } from '../../common/ingredient.js'
import { RecipeDefinition } from '../../schema/data/recipe.js'
import { Result, ResultInput } from '../../common/result.js'

export type Replacer<T> = (value: T) => T

export function createReplacer<T>(from: Predicate<T>, to: T): Replacer<T> {
   return (it: T) => {
      if (from(it)) return to
      return it
   }
}

export abstract class Recipe<TDefinition extends RecipeDefinition = RecipeDefinition> {
   constructor(protected readonly definition: TDefinition) {}

   abstract getIngredients(): IngredientInput[]

   abstract replaceIngredient(replace: Replacer<Ingredient>): Recipe

   abstract getResults(): ResultInput[]

   abstract replaceResult(replace: Replacer<Result>): Recipe

   toJSON(): TDefinition {
      return this.definition
   }
}

export type InlineRecipeParser = <TDefinition extends RecipeDefinition>(definition: TDefinition) => Recipe<TDefinition>

export default abstract class RecipeParser<TDefinition extends RecipeDefinition, TRecipe extends Recipe> {
   abstract create(definition: TDefinition, parse: InlineRecipeParser): TRecipe
}
