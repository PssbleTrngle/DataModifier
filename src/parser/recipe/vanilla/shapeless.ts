import RecipeParser, { Recipe, replace } from '..'
import { IngredientInput, Predicate, ResultInput } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'

export type ShapelessRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: IngredientInput[]
      result: ResultInput
   }>

class ShapelessRecipe extends Recipe<ShapelessRecipeDefinition> {
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
