import RecipeParser, { Recipe, replace } from '..'
import { Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'

export type ElvenTradeRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: Ingredient[]
      output: Result[]
      mana?: number
   }>

export class ElvenTradeRecipe extends Recipe<ElvenTradeRecipeDefinition> {
   getIngredients(): Ingredient[] {
      return this.definition.ingredients
   }

   getResults(): Result[] {
      return this.definition.output
   }

   replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): ElvenTradeRecipe {
      return new ElvenTradeRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<Ingredient>, to: Result): ElvenTradeRecipe {
      return new ElvenTradeRecipe({
         ...this.definition,
         output: this.definition.output.map(replace(from, to)),
      })
   }
}

export default class ElvenTradeRecipeParser extends RecipeParser<ElvenTradeRecipeDefinition, ElvenTradeRecipe> {
   create(definition: ElvenTradeRecipeDefinition): ElvenTradeRecipe {
      return new ElvenTradeRecipe(definition)
   }
}
