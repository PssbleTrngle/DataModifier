import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
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

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new RootComponentRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients.map(replace),
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
   create(definition: RootComponentRecipeDefinition): RootComponentRecipe {
      return new RootComponentRecipe(definition)
   }
}
