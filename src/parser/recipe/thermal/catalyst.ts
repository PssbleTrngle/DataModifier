import RecipeParser, { Recipe } from '..'
import { Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'

export type ThermalCatalystRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredient: Ingredient
      primary_mod?: number
      secondary_mod?: number
      energy_mod?: number
      min_chance?: number
      use_chance?: number
   }>

export class ThermalCatalystRecipe extends Recipe<ThermalCatalystRecipeDefinition> {
   getIngredients(): Ingredient[] {
      return [this.definition.ingredient]
   }

   getResults(): Result[] {
      return []
   }

   replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): ThermalCatalystRecipe {
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
