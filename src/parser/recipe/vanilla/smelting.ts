import RecipeParser, { Recipe } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type SmeltingRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredient: IngredientInput
      result: ResultInput
      experience?: number
   }>

export class SmeltingRecipe extends Recipe<SmeltingRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [this.definition.ingredient]
   }

   getResults(): ResultInput[] {
      return [this.definition.result]
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new SmeltingRecipe({
         ...this.definition,
         ingredient: to,
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
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
