import RecipeParser, { Recipe, replace } from '..'
import { Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'

type ShapelessRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: Ingredient[]
      result: Result
   }>

class ShapelessRecipe extends Recipe<ShapelessRecipeDefinition> {
   getIngredients(): Ingredient[] {
      return this.definition.ingredients
   }

   getResults(): Result[] {
      return [this.definition.result]
   }

   replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): Recipe {
      return new ShapelessRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<Ingredient>, to: Result): Recipe {
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
