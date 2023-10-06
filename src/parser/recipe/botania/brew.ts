import RecipeParser, { Recipe, replace } from '..'
import { Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'

export type BrewRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: Ingredient[]
      brew: string
   }>

export class BrewRecipe extends Recipe<BrewRecipeDefinition> {
   getIngredients(): Ingredient[] {
      return this.definition.ingredients
   }

   getResults(): Result[] {
      return []
   }

   replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): BrewRecipe {
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
