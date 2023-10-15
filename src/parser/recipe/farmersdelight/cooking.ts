import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { exists } from '@pssbletrngle/pack-resolver'
import { ResultInput } from '../../../common/result.js'

export type CookingRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: IngredientInput[]
      container?: IngredientInput
      result: ResultInput
      cookingTime?: number
      experience?: number
      recipe_book_tab?: string
   }>

export class CookingRecipe extends Recipe<CookingRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [this.definition.container, ...this.definition.ingredients].filter(exists)
   }

   getResults(): ResultInput[] {
      return [this.definition.result]
   }

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new CookingRecipe({
         ...this.definition,
         container: this.definition.container && replace(this.definition.container),
         ingredients: this.definition.ingredients.map(replace),
      })
   }

   replaceResult(replace: Replacer<ResultInput>): Recipe {
      return new CookingRecipe({
         ...this.definition,
         result: replace(this.definition.result),
      })
   }
}

export default class CookingRecipeParser extends RecipeParser<CookingRecipeDefinition, CookingRecipe> {
   create(definition: CookingRecipeDefinition): CookingRecipe {
      return new CookingRecipe(definition)
   }
}
