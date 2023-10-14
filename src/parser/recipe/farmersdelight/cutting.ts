import RecipeParser, { Recipe, replace } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
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

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new CuttingRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
      return new CuttingRecipe({
         ...this.definition,
         result: this.definition.result.map(replace(from, to)),
      })
   }
}

export default class CuttingRecipeParser extends RecipeParser<CuttingRecipeDefinition, CuttingRecipe> {
   create(definition: CuttingRecipeDefinition): CuttingRecipe | null {
      return new CuttingRecipe(definition)
   }
}
