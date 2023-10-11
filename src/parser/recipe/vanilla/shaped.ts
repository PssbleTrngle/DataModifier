import RecipeParser, { Recipe, replace } from '..'
import { IngredientInput, Predicate } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import { mapValues } from 'lodash-es'
import { ResultInput } from '../../../common/result'

export type ShapedRecipeDefinition = RecipeDefinition &
   Readonly<{
      key: Record<string, IngredientInput>
      pattern: string[]
      result: ResultInput
   }>

class ShapedRecipe extends Recipe<ShapedRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return Object.values(this.definition.key)
   }

   getResults(): ResultInput[] {
      return [this.definition.result]
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new ShapedRecipe({
         ...this.definition,
         key: mapValues(this.definition.key, replace(from, to)),
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
      return new ShapedRecipe({
         ...this.definition,
         result: to,
      })
   }
}

export default class ShapedParser extends RecipeParser<ShapedRecipeDefinition, ShapedRecipe> {
   create(definition: ShapedRecipeDefinition): ShapedRecipe {
      return new ShapedRecipe(definition)
   }
}
