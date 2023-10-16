import { Recipe } from './index.js'
import { IngredientInput } from '../../common/ingredient.js'
import { ResultInput } from '../../common/result.js'
import { RecipeDefinition } from '../../schema/recipe.js'

export default class IgnoredRecipe<T extends RecipeDefinition> extends Recipe<T> {
   getIngredients(): IngredientInput[] {
      return []
   }

   getResults(): ResultInput[] {
      return []
   }

   replaceIngredient(): Recipe {
      return new IgnoredRecipe(this.definition)
   }

   replaceResult(): Recipe {
      return new IgnoredRecipe(this.definition)
   }
}
