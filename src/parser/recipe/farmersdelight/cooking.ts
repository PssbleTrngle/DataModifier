import RecipeParser, { Recipe, replace, replaceOrKeep } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
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

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new CookingRecipe({
         ...this.definition,
         container: this.definition.container && replaceOrKeep(from, to, this.definition.container),
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
      return new CookingRecipe({
         ...this.definition,
         result: to,
      })
   }
}

export default class CookingRecipeParser extends RecipeParser<CookingRecipeDefinition, CookingRecipe> {
   create(definition: CookingRecipeDefinition): CookingRecipe {
      return new CookingRecipe(definition)
   }
}
