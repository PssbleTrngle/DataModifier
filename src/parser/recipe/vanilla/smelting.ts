import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
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

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new SmeltingRecipe({
         ...this.definition,
         ingredient: replace(this.definition.ingredient),
      })
   }

   replaceResult(replace: Replacer<ResultInput>): Recipe {
      return new SmeltingRecipe({
         ...this.definition,
         result: replace(this.definition.result),
      })
   }
}

export default class SmeltingParser extends RecipeParser<SmeltingRecipeDefinition, SmeltingRecipe> {
   create(definition: SmeltingRecipeDefinition): SmeltingRecipe {
      return new SmeltingRecipe(definition)
   }
}
