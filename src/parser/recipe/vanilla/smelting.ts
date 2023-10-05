import RecipeParser, { Recipe } from '..'
import { Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'

type SmeltingRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredient: Ingredient
      result: Result
      experience?: number
      cookingTime?: number
   }>

class SmeltingRecipe extends Recipe<SmeltingRecipeDefinition> {
   getIngredients(): Ingredient[] {
      return [this.definition.ingredient]
   }

   getResults(): Result[] {
      return [this.definition.result]
   }

   replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): Recipe {
      return new SmeltingRecipe({
         ...this.definition,
         ingredient: to,
      })
   }

   replaceResult(from: Predicate<Ingredient>, to: Result): Recipe {
      return new SmeltingRecipe({
         ...this.definition,
         result: to,
      })
   }
}

export default class SmeltingParser extends RecipeParser<SmeltingRecipeDefinition, SmeltingRecipe> {
   create(definition: SmeltingRecipeDefinition): SmeltingRecipe {
      return new SmeltingRecipe(definition)
   }
}
