import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type TerraPlateRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: IngredientInput[]
      result: ResultInput
      mana?: number
   }>

export class TerraPlateRecipe extends Recipe<TerraPlateRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return [this.definition.result]
   }

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new TerraPlateRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace),
      })
   }

   replaceResult(replace: Replacer<ResultInput>): Recipe {
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
