import RecipeParser, { Recipe, replace } from '..'
import { IngredientInput, Predicate } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import { ResultInput } from '../../../common/result'

export type ElvenTradeRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredients: IngredientInput[]
      output: ResultInput[]
      mana?: number
   }>

export class ElvenTradeRecipe extends Recipe<ElvenTradeRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return this.definition.output
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new ElvenTradeRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
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
