import RecipeParser, { Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type RootRitualRecipeDefinition = RecipeDefinition &
   Readonly<{
      color: string
      effect: string
      level: number
      incenses?: IngredientInput[]
      ingredients?: IngredientInput[]
   }>

export class RootRitualRecipe extends Recipe<RootRitualRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [...(this.definition.ingredients ?? []), ...(this.definition.incenses ?? [])]
   }

   getResults(): ResultInput[] {
      return []
   }

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new RootRitualRecipe({
         ...this.definition,
         ingredients: this.definition.ingredients?.map(replace),
         incenses: this.definition.incenses?.map(replace),
      })
   }

   replaceResult(): RootRitualRecipe {
      return new RootRitualRecipe(this.definition)
   }
}

export default class RootRitualRecipeParser extends RecipeParser<RootRitualRecipeDefinition, RootRitualRecipe> {
   create(definition: RootRitualRecipeDefinition): RootRitualRecipe {
      return new RootRitualRecipe(definition)
   }
}
