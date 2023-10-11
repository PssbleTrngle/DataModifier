import RecipeParser, { Recipe } from '..'
import { createResult, IngredientInput, Predicate, ResultInput } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import { encodeId } from '../../../common/id'

export type StonecuttingRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredient: IngredientInput
      result: string
      count?: number
   }>

class StonecuttingRecipe extends Recipe<StonecuttingRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [this.definition.ingredient]
   }

   getResults(): ResultInput[] {
      return [{ item: encodeId(this.definition.result), count: this.definition.count }]
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new StonecuttingRecipe({
         ...this.definition,
         ingredient: to,
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
      const result = createResult(to)
      if (!('item' in result)) throw new Error('stonecutting does only support item results')

      return new StonecuttingRecipe({
         ...this.definition,
         result: result.item,
         count: result.count ?? 1,
      })
   }
}

export default class StonecuttingParser extends RecipeParser<StonecuttingRecipeDefinition, StonecuttingRecipe> {
   create(definition: StonecuttingRecipeDefinition): StonecuttingRecipe {
      return new StonecuttingRecipe(definition)
   }
}
