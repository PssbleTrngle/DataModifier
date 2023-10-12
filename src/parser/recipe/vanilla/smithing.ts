import RecipeParser, { Recipe, replaceOrKeep } from '..'
import { IngredientInput, Predicate } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import { ResultInput } from '../../../common/result'

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

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new SmithingRecipe({
         ...this.definition,
         base: replaceOrKeep(from, to, this.definition.base),
         addition: replaceOrKeep(from, to, this.definition.addition),
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
      return new SmithingRecipe({
         ...this.definition,
         result: to,
      })
   }
}

export default class SmithingParser extends RecipeParser<SmithingRecipeDefinition, SmithingRecipe> {
   create(definition: SmithingRecipeDefinition): SmithingRecipe {
      return new SmithingRecipe(definition)
   }
}
