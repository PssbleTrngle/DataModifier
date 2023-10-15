import RecipeParser, { InlineRecipeParser, Recipe } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type NbtWrapperRecipeDefinition = RecipeDefinition &
   Readonly<{
      nbt: string
      recipe: RecipeDefinition
   }>

export class NbtWrapperRecipe extends Recipe<NbtWrapperRecipeDefinition> {
   constructor(definition: Omit<NbtWrapperRecipeDefinition, 'recipe'>, private readonly recipe: Recipe) {
      super({
         ...definition,
         recipe: recipe.toJSON(),
      })
   }

   getIngredients(): IngredientInput[] {
      return this.recipe.getIngredients()
   }

   getResults(): ResultInput[] {
      return this.recipe.getResults()
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new NbtWrapperRecipe(this.definition, this.recipe.replaceIngredient(from, to))
   }

   replaceResult(from: Predicate<IngredientInput>, to: ResultInput): Recipe {
      return new NbtWrapperRecipe(this.definition, this.recipe.replaceResult(from, to))
   }
}

export default class NbtWrapperRecipeParser extends RecipeParser<NbtWrapperRecipeDefinition, NbtWrapperRecipe> {
   create(definition: NbtWrapperRecipeDefinition, parser: InlineRecipeParser): NbtWrapperRecipe {
      const recipe = parser(definition.recipe)
      return new NbtWrapperRecipe(definition, recipe)
   }
}
