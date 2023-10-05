import RecipeParser, { Recipe, replace } from '..'
import { Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'

type SmithingRecipeDefinition = RecipeDefinition &
   Readonly<{
      base: Ingredient
      addition: Ingredient
      result: Result
   }>

class SmithingRecipe extends Recipe<SmithingRecipeDefinition> {
   getIngredients(): Ingredient[] {
      return [this.definition.base, this.definition.addition]
   }

   getResults(): Result[] {
      return [this.definition.result]
   }

   replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): Recipe {
      return new SmithingRecipe({
         ...this.definition,
         base: replace(from, to)(this.definition.base),
         addition: replace(from, to)(this.definition.addition),
      })
   }

   replaceResult(from: Predicate<Ingredient>, to: Result): Recipe {
      return new SmithingRecipe({
         ...this.definition,
         result: to,
      })
   }
}

export default class SmithingParser extends RecipeParser<SmithingRecipeDefinition, SmithingRecipe> {
   create(definition: SmithingRecipeDefinition): SmithingRecipe {
      return new SmithingRecipe(definition)
   }
}
