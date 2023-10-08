import RecipeParser, { Recipe, replace } from '..'
import { Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import { mapValues } from 'lodash-es'

export type ShapedRecipeDefinition = RecipeDefinition &
   Readonly<{
      key: Record<string, Ingredient>
      pattern: string[]
      result: Result
   }>

class ShapedRecipe extends Recipe<ShapedRecipeDefinition> {
   getIngredients(): Ingredient[] {
      return Object.values(this.definition.key)
   }

   getResults(): Result[] {
      return [this.definition.result]
   }

   replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): Recipe {
      return new ShapedRecipe({
         ...this.definition,
         key: mapValues(this.definition.key, replace(from, to)),
      })
   }

   replaceResult(from: Predicate<Ingredient>, to: Result): Recipe {
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
