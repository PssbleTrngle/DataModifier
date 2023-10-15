import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type SmithingRecipeDefinition = RecipeDefinition &
   Readonly<{
      base: IngredientInput
      addition: IngredientInput
      result: ResultInput
   }>

export class SmithingRecipe extends Recipe<SmithingRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [this.definition.base, this.definition.addition]
   }

   getResults(): ResultInput[] {
      return [this.definition.result]
   }

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new SmithingRecipe({
         ...this.definition,
         base: replace(this.definition.base),
         addition: replace(this.definition.addition),
      })
   }

   replaceResult(replace: Replacer<ResultInput>): Recipe {
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
