import RecipeParser, { Recipe } from '..'
import { IngredientInput, Predicate } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import RecipeLoader from '../../../loader/recipe'
import { ResultInput } from '../../../common/result'

export type NbtWrapperRecipeDefinition = RecipeDefinition &
   Readonly<{
      nbt: string
      recipe: RecipeDefinition
   }>

export class NbtWrapperRecipe extends Recipe<Omit<NbtWrapperRecipeDefinition, 'recipe'>> {
   constructor(definition: Omit<NbtWrapperRecipeDefinition, 'recipe'>, private readonly recipe: Recipe) {
      super(definition)
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
   constructor(private readonly loader: RecipeLoader) {
      super()
   }

   create(definition: NbtWrapperRecipeDefinition): NbtWrapperRecipe | null {
      const recipe = this.loader.parse(definition.recipe)
      if (!recipe) return null
      return new NbtWrapperRecipe(definition, recipe)
   }
}
