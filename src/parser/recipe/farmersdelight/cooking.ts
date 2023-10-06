import RecipeParser, { Recipe, replace } from '..'
import { Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import { exists } from '@pssbletrngle/pack-resolver'

export type CookingRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: Ingredient[]
      container?: Ingredient
      result: Result
      cookingTime?: number
      experience?: number
      recipe_book_tab?: string
   }>

export class CookingRecipe extends Recipe<CookingRecipeDefinition> {
   getIngredients(): Ingredient[] {
      return [this.definition.container, ...this.definition.ingredients].filter(exists)
   }

   getResults(): Result[] {
      return [this.definition.result]
   }

   replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): CookingRecipe {
      return new CookingRecipe({
         ...this.definition,
         container: this.definition.container && replace(from, to)(this.definition.container),
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<Ingredient>, to: Result): CookingRecipe {
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
