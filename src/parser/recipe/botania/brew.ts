import RecipeParser, { Recipe, replace } from '..'
import { IngredientInput, Predicate } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import { ResultInput } from '../../../common/result'

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
