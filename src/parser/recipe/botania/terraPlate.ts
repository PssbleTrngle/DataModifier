import RecipeParser, { Recipe, Replacer } from '../index.js'
import { Ingredient, IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { Result, ResultInput } from '../../../common/result.js'

export type TerraPlateRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: Ingredient[]
      result: Result
      mana?: number
   }>

export class TerraPlateRecipe extends Recipe<TerraPlateRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return [this.definition.result]
   }

   replaceIngredient(replace: Replacer<Ingredient>): Recipe {
      return new TerraPlateRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace),
      })
   }

   replaceResult(replace: Replacer<Result>): Recipe {
      return new TerraPlateRecipe({
         ...this.definition,
         result: replace(this.definition.result),
      })
   }
}

export default class TerraPlateRecipeParser extends RecipeParser<TerraPlateRecipeDefinition, TerraPlateRecipe> {
   create(definition: TerraPlateRecipeDefinition): TerraPlateRecipe {
      return new TerraPlateRecipe(definition)
   }
}
