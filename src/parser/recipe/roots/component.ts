import RecipeParser, { Recipe, replace } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type RootComponentRecipeDefinition = RecipeDefinition &
   Readonly<{
      effect: string
      ingredients: IngredientInput[]
   }>

export class RootComponentRecipe extends Recipe<RootComponentRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return this.definition.ingredients
   }

   getResults(): ResultInput[] {
      return []
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new RootComponentRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace(from, to)),
      })
   }

   replaceResult(): RootComponentRecipe {
      return new RootComponentRecipe(this.definition)
   }
}

export default class RootComponentRecipeParser extends RecipeParser<
   RootComponentRecipeDefinition,
   RootComponentRecipe
> {
   create(definition: RootComponentRecipeDefinition): RootComponentRecipe | null {
      return new RootComponentRecipe(definition)
   }
}
