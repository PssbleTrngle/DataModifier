import RecipeParser, { Recipe, Replacer } from '../index.js'
import { Ingredient, IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/data/recipe.js'
import { Result, ResultInput } from '../../../common/result.js'
import { WrappedIngredient } from './index.js'

export type NasaWorkbenchRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: WrappedIngredient[]
      output: Result
      mana?: number
   }>

export class NasaWorkbenchRecipe extends Recipe<NasaWorkbenchRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients.map(it => it.ingredient)
   }

   getResults(): ResultInput[] {
      return [this.definition.output]
   }

   replaceIngredient(replace: Replacer<Ingredient>): Recipe {
      return new NasaWorkbenchRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(it => ({
            ...it,
            ingredient: replace(it.ingredient),
         })),
      })
   }

   replaceResult(replace: Replacer<Result>): Recipe {
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
