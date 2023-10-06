import RecipeParser, { Recipe, replace } from '..'
import { Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'

export type CuttingRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: Ingredient[]
      result: Result[]
      tool: unknown
   }>

export class CuttingRecipe extends Recipe<CuttingRecipeDefinition> {
   getIngredients(): Ingredient[] {
      return this.definition.ingredients
   }

   getResults(): Result[] {
      return this.definition.result
   }

   replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): CuttingRecipe {
      return new CuttingRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<Ingredient>, to: Result): CuttingRecipe {
      return new CuttingRecipe({
         ...this.definition,
         result: this.definition.result.map(replace(from, to)),
      })
   }
}

export default class CuttingRecipeParser extends RecipeParser<CuttingRecipeDefinition, CuttingRecipe> {
   create(definition: CuttingRecipeDefinition): CuttingRecipe {
      return new CuttingRecipe(definition)
   }
}
