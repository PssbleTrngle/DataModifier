import RecipeParser, { Recipe, replace } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type HammeringRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: IngredientInput[]
      result: ResultInput
      mana?: number
   }>

export class HammeringRecipe extends Recipe<HammeringRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return [this.definition.result]
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new HammeringRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
      return new HammeringRecipe({
         ...this.definition,
         result: to,
      })
   }
}

export default class HammeringRecipeParser extends RecipeParser<HammeringRecipeDefinition, HammeringRecipe> {
   create(definition: HammeringRecipeDefinition): HammeringRecipe {
      return new HammeringRecipe(definition)
   }
}
