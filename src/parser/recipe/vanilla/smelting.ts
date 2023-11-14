import RecipeParser, { Recipe, Replacer } from '../index.js'
import { Ingredient, IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/data/recipe.js'
import { Result, ResultInput } from '../../../common/result.js'

export type SmeltingRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredient: Ingredient
      result: Result
      experience?: number
   }>

export class SmeltingRecipe extends Recipe<SmeltingRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [this.definition.ingredient]
   }

   getResults(): ResultInput[] {
      return [this.definition.result]
   }

   replaceIngredient(replace: Replacer<Ingredient>): Recipe {
      return new SmeltingRecipe({
         ...this.definition,
         ingredient: replace(this.definition.ingredient),
      })
   }

   replaceResult(replace: Replacer<Result>): Recipe {
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
