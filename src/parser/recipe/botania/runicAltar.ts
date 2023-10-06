import RecipeParser, { Recipe, replace } from '..'
import { Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'

export type RunicAltarRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: Ingredient[]
      output: Result
      mana?: number
   }>

export class RunicAltarRecipe extends Recipe<RunicAltarRecipeDefinition> {
   getIngredients(): Ingredient[] {
      return this.definition.ingredients
   }

   getResults(): Result[] {
      return [this.definition.output]
   }

   replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): RunicAltarRecipe {
      return new RunicAltarRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<Ingredient>, to: Result): RunicAltarRecipe {
      return new RunicAltarRecipe({
         ...this.definition,
         output: to,
      })
   }
}

export default class RunicAltarRecipeParser extends RecipeParser<RunicAltarRecipeDefinition, RunicAltarRecipe> {
   create(definition: RunicAltarRecipeDefinition): RunicAltarRecipe {
      return new RunicAltarRecipe(definition)
   }
}
