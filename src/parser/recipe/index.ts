import { IngredientInput, Predicate } from '../../common/ingredient'
import { RecipeDefinition } from '../../schema/recipe'
import { ResultInput } from '../../common/result'

export function replace<T>(from: Predicate<T>, to: T) {
   return (it: T) => {
      if (from(it)) return to
      return it
   }
}

export function replaceOrKeep<T>(from: Predicate<T>, to: T, value: T) {
   return replace(from, to)(value)
}

export abstract class Recipe<TDefinition extends RecipeDefinition = RecipeDefinition> {
   constructor(protected readonly definition: TDefinition) {}

   abstract getIngredients(): IngredientInput[]

   abstract replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe

   abstract getResults(): ResultInput[]

   abstract replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe

   toDefinition(): TDefinition {
      return this.definition
   }
}

export default abstract class RecipeParser<TDefinition extends RecipeDefinition, TRecipe extends Recipe> {
   abstract create(definition: TDefinition): TRecipe | null
}
