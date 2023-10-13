import RecipeParser, { Recipe, replace } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
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

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new TerraPlateRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
      return new TerraPlateRecipe({
         ...this.definition,
         result: to,
      })
   }
}

export default class TerraPlateRecipeParser extends RecipeParser<TerraPlateRecipeDefinition, TerraPlateRecipe> {
   create(definition: TerraPlateRecipeDefinition): TerraPlateRecipe {
      return new TerraPlateRecipe(definition)
   }
}
