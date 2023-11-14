import RecipeParser, { Recipe, Replacer } from '../index.js'
import { Ingredient, IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/data/recipe.js'
import { Result, ResultInput } from '../../../common/result.js'

export type SmithingRecipeDefinition = RecipeDefinition &
   Readonly<{
      base: Ingredient
      addition: Ingredient
      result: Result
   }>

export class SmithingRecipe extends Recipe<SmithingRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [this.definition.base, this.definition.addition]
   }

   getResults(): ResultInput[] {
      return [this.definition.result]
   }

   replaceIngredient(replace: Replacer<Ingredient>): Recipe {
      return new SmithingRecipe({
         ...this.definition,
         base: replace(this.definition.base),
         addition: replace(this.definition.addition),
      })
   }

   replaceResult(replace: Replacer<Result>): Recipe {
      return new SmithingRecipe({
         ...this.definition,
         result: replace(this.definition.result),
      })
   }
}

export default class SmithingParser extends RecipeParser<SmithingRecipeDefinition, SmithingRecipe> {
   create(definition: SmithingRecipeDefinition): SmithingRecipe {
      return new SmithingRecipe(definition)
   }
}
