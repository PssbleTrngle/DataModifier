import RecipeParser, { Recipe, Replacer } from '../index.js'
import { Ingredient, IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/data/recipe.js'
import { Result, ResultInput } from '../../../common/result.js'

export type CreateProcessingRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: Ingredient[]
      results: Result[]
      heatRequirement?: string
      processingTime?: number
      keepHeldItem?: boolean
   }>

export class CreateProcessingRecipe extends Recipe<CreateProcessingRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return this.definition.results
   }

   replaceIngredient(replace: Replacer<Ingredient>): CreateProcessingRecipe {
      return new CreateProcessingRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace),
      })
   }

   replaceResult(replace: Replacer<Result>): CreateProcessingRecipe {
      return new CreateProcessingRecipe({
         ...this.definition,
         results: this.definition.results.map(replace),
      })
   }
}

export default class CreateProcessingRecipeParser extends RecipeParser<
   CreateProcessingRecipeDefinition,
   CreateProcessingRecipe
> {
   create(definition: CreateProcessingRecipeDefinition): CreateProcessingRecipe {
      return new CreateProcessingRecipe(definition)
   }
}
