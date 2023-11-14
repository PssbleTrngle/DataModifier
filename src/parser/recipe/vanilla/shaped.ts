import RecipeParser, { Recipe, Replacer } from '../index.js'
import { Ingredient, IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/data/recipe.js'
import { mapValues } from 'lodash-es'
import { Result, ResultInput } from '../../../common/result.js'

export type ShapedRecipeDefinition = RecipeDefinition &
   Readonly<{
      key: Record<string, Ingredient>
      pattern: string[]
      result: Result
   }>

export class ShapedRecipe extends Recipe<ShapedRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return Object.values(this.definition.key)
   }

   getResults(): ResultInput[] {
      return [this.definition.result]
   }

   replaceIngredient(replace: Replacer<Ingredient>): Recipe {
      return new ShapedRecipe({
         ...this.definition,
         key: mapValues(this.definition.key, replace),
      })
   }

   replaceResult(replace: Replacer<Result>): Recipe {
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
