import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type CuttingRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: IngredientInput[]
      result: ResultInput[]
      tool: unknown
   }>

export class CuttingRecipe extends Recipe<CuttingRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return this.definition.result
   }

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new CuttingRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace),
      })
   }

   replaceResult(replace: Replacer<ResultInput>): Recipe {
      return new CuttingRecipe({
         ...this.definition,
         result: this.definition.result.map(replace),
      })
   }
}

export default class CuttingRecipeParser extends RecipeParser<CuttingRecipeDefinition, CuttingRecipe> {
   create(definition: CuttingRecipeDefinition): CuttingRecipe {
      return new CuttingRecipe(definition)
   }
}
