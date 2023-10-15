import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type NasaWorkbenchRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: IngredientInput[]
      output: ResultInput
      mana?: number
   }>

export class NasaWorkbenchRecipe extends Recipe<NasaWorkbenchRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return [this.definition.output]
   }

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new NasaWorkbenchRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace),
      })
   }

   replaceResult(replace: Replacer<ResultInput>): Recipe {
      return new NasaWorkbenchRecipe({
         ...this.definition,
         output: replace(this.definition.output),
      })
   }
}

export default class NasaWorkbenchRecipeParser extends RecipeParser<
   NasaWorkbenchRecipeDefinition,
   NasaWorkbenchRecipe
> {
   create(definition: NasaWorkbenchRecipeDefinition): NasaWorkbenchRecipe {
      return new NasaWorkbenchRecipe(definition)
   }
}
