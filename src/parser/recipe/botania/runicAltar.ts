import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

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

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new RunicAltarRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace),
      })
   }

   replaceResult(replace: Replacer<ResultInput>): Recipe {
      return new RunicAltarRecipe({
         ...this.definition,
         output: replace(this.definition.output),
      })
   }
}

export default class RunicAltarRecipeParser extends RecipeParser<RunicAltarRecipeDefinition, RunicAltarRecipe> {
   create(definition: RunicAltarRecipeDefinition): RunicAltarRecipe {
      return new RunicAltarRecipe(definition)
   }
}
