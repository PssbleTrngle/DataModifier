import RecipeParser, { Recipe, Replacer } from '../index.js'
import { Ingredient, IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/data/recipe.js'
import { Result, ResultInput } from '../../../common/result.js'

export type ShapelessRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: Ingredient[]
      result: Result
   }>

export class ShapelessRecipe extends Recipe<ShapelessRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return [this.definition.result]
   }

   replaceIngredient(replace: Replacer<Ingredient>): Recipe {
      return new ShapelessRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace),
      })
   }

   replaceResult(replace: Replacer<Result>): Recipe {
      return new ShapelessRecipe({
         ...this.definition,
         result: replace(this.definition.result),
      })
   }
}

export default class ShapelessParser extends RecipeParser<ShapelessRecipeDefinition, ShapelessRecipe> {
   create(definition: ShapelessRecipeDefinition): ShapelessRecipe {
      return new ShapelessRecipe(definition)
   }
}
