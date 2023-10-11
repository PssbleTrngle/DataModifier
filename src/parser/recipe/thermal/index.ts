import RecipeParser, { Recipe, replace, replaceOrKeep } from '..'
import { IngredientInput, Predicate } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import { arrayOrSelf, exists } from '@pssbletrngle/pack-resolver'
import { ResultInput } from '../../../common/result'
import { fromThermalIngredient, ThermalIngredientInput, toThermalIngredient } from './ingredient'

export type ThermalRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredient?: ThermalIngredientInput
      ingredients?: ThermalIngredientInput[]
      result: ResultInput[] | ResultInput
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
   getIngredients(): IngredientInput[] {
      return [this.definition.ingredient, ...(this.definition.ingredients ?? [])]
         .filter(exists)
         .map(fromThermalIngredient)
   }

   getResults(): ResultInput[] {
      return arrayOrSelf(this.definition.result)
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new ThermalRecipe({
         ...this.definition,
         ingredient:
            this.definition.ingredient &&
            toThermalIngredient(replaceOrKeep(from, to, fromThermalIngredient(this.definition.ingredient))),
         ingredients: this.definition.ingredients
            ?.map(fromThermalIngredient)
            ?.map(replace(from, to))
            ?.map(toThermalIngredient),
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
      return new ThermalRecipe({
         ...this.definition,
         result: arrayOrSelf(this.definition.result).map(replace(from, to)),
      })
   }
}

export default class ThermalRecipeParser extends RecipeParser<ThermalRecipeDefinition, ThermalRecipe> {
   create(definition: ThermalRecipeDefinition): ThermalRecipe {
      return new ThermalRecipe(definition)
   }
}
