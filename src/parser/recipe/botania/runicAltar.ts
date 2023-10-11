import RecipeParser, { Recipe, replace } from '..'
import { IngredientInput, Predicate } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import { ResultInput } from '../../../common/result'

export type RunicAltarRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: IngredientInput[]
      output: ResultInput
      mana?: number
   }>

export class RunicAltarRecipe extends Recipe<RunicAltarRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return [this.definition.output]
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new RunicAltarRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
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
