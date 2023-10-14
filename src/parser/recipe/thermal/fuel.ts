import RecipeParser, { Recipe, replaceOrKeep } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type ThermalFuelRecipeDefinition = RecipeDefinition &
   Readonly<{
      energy: number
      ingredient: IngredientInput
   }>

export class ThermalFuelRecipe extends Recipe<ThermalFuelRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [this.definition.ingredient]
   }

   getResults(): ResultInput[] {
      return []
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new ThermalFuelRecipe({
         ...this.definition,
         ingredient: replaceOrKeep(from, to, this.definition.ingredient),
      })
   }

   replaceResult(): ThermalFuelRecipe {
      return new ThermalFuelRecipe(this.definition)
   }
}

export default class ThermalFuelRecipeParser extends RecipeParser<ThermalFuelRecipeDefinition, ThermalFuelRecipe> {
   create(definition: ThermalFuelRecipeDefinition): ThermalFuelRecipe | null {
      return new ThermalFuelRecipe(definition)
   }
}
