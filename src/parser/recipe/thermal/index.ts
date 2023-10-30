import RecipeParser, { Recipe, Replacer } from '../index.js'
import { Ingredient, IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { arrayOrSelf, exists } from '@pssbletrngle/pack-resolver'
import { Result, ResultInput } from '../../../common/result.js'
import { fromThermalIngredient, ThermalIngredientInput, toThermalIngredient } from './ingredient.js'

export type ThermalRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredient?: ThermalIngredientInput
      ingredients?: ThermalIngredientInput[]
      result: Result[] | Result
      energy?: number
      experience?: number
   }>

export class ThermalRecipe extends Recipe<ThermalRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [this.definition.ingredient, ...(this.definition.ingredients ?? [])]
         .filter(exists)
         .map(fromThermalIngredient)
   }

   getResults(): ResultInput[] {
      return arrayOrSelf(this.definition.result)
   }

   replaceIngredient(replace: Replacer<Ingredient>): Recipe {
      return new ThermalRecipe({
         ...this.definition,
         ingredient:
            this.definition.ingredient &&
            toThermalIngredient(replace(fromThermalIngredient(this.definition.ingredient))),
         ingredients: this.definition.ingredients?.map(fromThermalIngredient)?.map(replace)?.map(toThermalIngredient),
      })
   }

   replaceResult(replace: Replacer<Result>): Recipe {
      return new ThermalRecipe({
         ...this.definition,
         result: arrayOrSelf(this.definition.result).map(replace),
      })
   }
}

export default class ThermalRecipeParser extends RecipeParser<ThermalRecipeDefinition, ThermalRecipe> {
   create(definition: ThermalRecipeDefinition): ThermalRecipe {
      return new ThermalRecipe(definition)
   }
}
