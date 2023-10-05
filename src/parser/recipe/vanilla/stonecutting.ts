import RecipeParser, { Recipe } from '..'
import { Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'

type StonecuttingRecipeDefinition = RecipeDefinition &
   Readonly<{
      ingredient: Ingredient
      result: string
      count?: number
   }>

class StonecuttingRecipe extends Recipe<StonecuttingRecipeDefinition> {
   getIngredients(): Ingredient[] {
      return [this.definition.ingredient]
   }

   getResults(): Result[] {
      return [{ item: this.definition.result, count: this.definition.count }]
   }

   replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): Recipe {
      return new StonecuttingRecipe({
         ...this.definition,
         ingredient: to,
      })
   }

   replaceResult(from: Predicate<Ingredient>, to: Result): Recipe {
      if (!('item' in to)) throw new Error('stonecutting does only support item results')

      return new StonecuttingRecipe({
         ...this.definition,
         result: to.item,
         count: to.count ?? 1,
      })
   }
}

export default class StonecuttingParser extends RecipeParser<StonecuttingRecipeDefinition, StonecuttingRecipe> {
   create(definition: StonecuttingRecipeDefinition): StonecuttingRecipe {
      return new StonecuttingRecipe(definition)
   }
}
