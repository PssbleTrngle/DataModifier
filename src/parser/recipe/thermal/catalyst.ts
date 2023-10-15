import RecipeParser, { Recipe } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type ThermalCatalystRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredient: IngredientInput
      primary_mod?: number
      secondary_mod?: number
      energy_mod?: number
      min_chance?: number
      use_chance?: number
   }>

export class ThermalCatalystRecipe extends Recipe<ThermalCatalystRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [this.definition.ingredient]
   }

   getResults(): ResultInput[] {
      return []
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new ThermalCatalystRecipe({
         ...this.definition,
         ingredient: to,
      })
   }

   replaceResult(): ThermalCatalystRecipe {
      return new ThermalCatalystRecipe(this.definition)
   }
}

export default class ThermalCatalystRecipeParser extends RecipeParser<
   ThermalCatalystRecipeDefinition,
   ThermalCatalystRecipe
> {
   create(definition: ThermalCatalystRecipeDefinition): ThermalCatalystRecipe {
      return new ThermalCatalystRecipe(definition)
   }
}
