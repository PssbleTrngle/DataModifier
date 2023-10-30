import RecipeParser, { Recipe, Replacer } from '../index.js'
import { Ingredient, IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { Result, ResultInput } from '../../../common/result.js'
import { exists } from '@pssbletrngle/pack-resolver'

export type RootRitualRecipeDefinition = RecipeDefinition &
   Readonly<{
      color: string
      effect: string
      level: number
      incenses?: Ingredient[]
      ingredients?: Ingredient[]
      result?: Result
   }>

export class RootRitualRecipe extends Recipe<RootRitualRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [...(this.definition.ingredients ?? []), ...(this.definition.incenses ?? [])]
   }

   getResults(): ResultInput[] {
      return [this.definition.result].filter(exists)
   }

   replaceIngredient(replace: Replacer<Ingredient>): Recipe {
      return new RootRitualRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients?.map(replace),
         incenses: this.definition.incenses?.map(replace),
      })
   }

   replaceResult(replace: Replacer<Result>): RootRitualRecipe {
      return new RootRitualRecipe({
         ...this.definition,
         result: this.definition.result && replace(this.definition.result),
      })
   }
}

export default class RootRitualRecipeParser extends RecipeParser<RootRitualRecipeDefinition, RootRitualRecipe> {
   create(definition: RootRitualRecipeDefinition): RootRitualRecipe {
      return new RootRitualRecipe(definition)
   }
}
