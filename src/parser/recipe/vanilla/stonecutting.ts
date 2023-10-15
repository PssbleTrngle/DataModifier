import RecipeParser, { Recipe } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { encodeId } from '../../../common/id.js'
import { createResult, ResultInput } from '../../../common/result.js'
import { IllegalShapeError } from '../../../error.js'

export type StonecuttingRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredient: IngredientInput
      result: string
      count?: number
   }>

export class StonecuttingRecipe extends Recipe<StonecuttingRecipeDefinition> {
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
      if (!('item' in result)) throw new IllegalShapeError('stonecutting does only support item results', result)

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
