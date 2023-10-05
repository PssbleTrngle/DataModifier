import RecipeParser, { Recipe, replace } from '..'
import { Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'

export type ProcessingRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: Ingredient[]
      results: Result[]
      heatRequirement?: string
   }>

export class ProcessingRecipe extends Recipe<ProcessingRecipeDefinition> {
   getIngredients(): Ingredient[] {
      return this.definition.ingredients
   }

   getResults(): Result[] {
      return this.definition.results
   }

   replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): ProcessingRecipe {
      return new ProcessingRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<Ingredient>, to: Result): ProcessingRecipe {
      return new ProcessingRecipe({
         ...this.definition,
         results: this.definition.results.map(replace(from, to)),
      })
   }
}

export default class ProcessingRecipeParser extends RecipeParser<ProcessingRecipeDefinition, ProcessingRecipe> {
   create(definition: ProcessingRecipeDefinition): ProcessingRecipe {
      return new ProcessingRecipe(definition)
   }
}
