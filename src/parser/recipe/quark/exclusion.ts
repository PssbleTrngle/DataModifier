import RecipeParser, { InlineRecipeParser, Recipe, Replacer } from '../index.js'
import { IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'

export type QuarkExclusionRecipeDefinition<T extends RecipeDefinition = RecipeDefinition> = T &
   Readonly<{
      true_type: string
      exclusions?: string[]
   }>

export class QuarkExclusionRecipe<
   TDefinition extends RecipeDefinition = RecipeDefinition,
   TRecipe extends Recipe<TDefinition> = Recipe<TDefinition>
> extends Recipe<QuarkExclusionRecipeDefinition<TDefinition>> {
   constructor(definition: QuarkExclusionRecipeDefinition<TDefinition>, private readonly trueRecipe: TRecipe) {
      super({
         ...definition,
         ...trueRecipe.toJSON(),
         true_type: trueRecipe.toJSON().type,
         type: definition.type,
      })
   }

   getIngredients(): IngredientInput[] {
      return this.trueRecipe.getIngredients()
   }

   getResults(): ResultInput[] {
      return this.trueRecipe.getResults()
   }

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new QuarkExclusionRecipe(this.definition, this.trueRecipe.replaceIngredient(replace) as TRecipe)
   }

   replaceResult(replace: Replacer<ResultInput>): Recipe {
      return new QuarkExclusionRecipe(this.definition, this.trueRecipe.replaceResult(replace) as TRecipe)
   }
}

export default class QuarkExclusionRecipeParser extends RecipeParser<
   QuarkExclusionRecipeDefinition,
   QuarkExclusionRecipe
> {
   create(definition: QuarkExclusionRecipeDefinition, parser: InlineRecipeParser): QuarkExclusionRecipe {
      const trueRecipe = parser({ ...definition, type: definition.true_type })
      return new QuarkExclusionRecipe(definition, trueRecipe)
   }
}
