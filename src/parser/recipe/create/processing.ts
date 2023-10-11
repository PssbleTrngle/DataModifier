import RecipeParser, { Recipe, replace } from '..'
import { IngredientInput, Predicate, ResultInput } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'

export type ProcessingRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: IngredientInput[]
      results: ResultInput[]
      heatRequirement?: string
   }>

export class ProcessingRecipe extends Recipe<ProcessingRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return this.definition.results
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): ProcessingRecipe {
      return new ProcessingRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): ProcessingRecipe {
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
