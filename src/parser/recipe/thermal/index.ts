import RecipeParser, { Recipe, replace } from '..'
import { Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import { exists } from '@pssbletrngle/pack-resolver'

export type ThermalRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredient?: Ingredient
      ingredients?: Ingredient[]
      result: Result[]
      energy?: number
      experience?: number
   }>

/*
TODO seen Ingredient in form
[
    {
      "item": "minecraft:cobblestone"
    },
    {
      "item": "thermal:quartz_dust"
    }
]
*/

export class ThermalRecipe extends Recipe<ThermalRecipeDefinition> {
   getIngredients(): Ingredient[] {
      return [this.definition.ingredient, ...(this.definition.ingredients ?? [])].filter(exists)
   }

   getResults(): Result[] {
      return this.definition.result
   }

   replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): ThermalRecipe {
      return new ThermalRecipe({
         ...this.definition,
         ingredient: this.definition.ingredient && replace(from, to)(this.definition.ingredient),
         ingredients: this.definition.ingredients?.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<Ingredient>, to: Result): ThermalRecipe {
      return new ThermalRecipe({
         ...this.definition,
         result: this.definition.result.map(replace(from, to)),
      })
   }
}

export default class ThermalRecipeParser extends RecipeParser<ThermalRecipeDefinition, ThermalRecipe> {
   create(definition: ThermalRecipeDefinition): ThermalRecipe {
      return new ThermalRecipe(definition)
   }
}
