import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { mapValues } from 'lodash-es'
import { ResultInput } from '../../../common/result.js'

export type ShapedRecipeDefinition = RecipeDefinition &
   Readonly<{
      key: Record<string, IngredientInput>
      pattern: string[]
      result: ResultInput
   }>

export class ShapedRecipe extends Recipe<ShapedRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return Object.values(this.definition.key)
   }

   getResults(): ResultInput[] {
      return [this.definition.result]
   }

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new ShapedRecipe({
         ...this.definition,
         key: mapValues(this.definition.key, replace),
      })
   }

   replaceResult(replace: Replacer<ResultInput>): Recipe {
      return new ShapedRecipe({
         ...this.definition,
         result: replace(this.definition.result),
      })
   }
}

export default class ShapedParser extends RecipeParser<ShapedRecipeDefinition, ShapedRecipe> {
   create(definition: ShapedRecipeDefinition): ShapedRecipe {
      return new ShapedRecipe(definition)
   }
}
