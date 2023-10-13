import RecipeParser, { Recipe, replace } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type ShapelessRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: IngredientInput[]
      result: ResultInput
   }>

export class ShapelessRecipe extends Recipe<ShapelessRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return [this.definition.result]
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new ShapelessRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
      return new ShapelessRecipe({
         ...this.definition,
         result: to,
      })
   }
}

export default class ShapelessParser extends RecipeParser<ShapelessRecipeDefinition, ShapelessRecipe> {
   create(definition: ShapelessRecipeDefinition): ShapelessRecipe {
      return new ShapelessRecipe(definition)
   }
}
