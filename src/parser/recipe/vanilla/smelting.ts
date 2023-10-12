import RecipeParser, { Recipe } from '..'
import { IngredientInput, Predicate } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import { ResultInput } from '../../../common/result'

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
