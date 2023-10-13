import RecipeParser, { Recipe, replace } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type BrewRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: IngredientInput[]
      brew: string
   }>

export class BrewRecipe extends Recipe<BrewRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return []
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new BrewRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(): BrewRecipe {
      return new BrewRecipe(this.definition)
   }
}

export default class BrewRecipeParser extends RecipeParser<BrewRecipeDefinition, BrewRecipe> {
   create(definition: BrewRecipeDefinition): BrewRecipe {
      return new BrewRecipe(definition)
   }
}
