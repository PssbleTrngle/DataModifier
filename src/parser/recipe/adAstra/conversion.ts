import RecipeParser, { Recipe, Replacer } from '../index.js'
import { Ingredient, IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/data/recipe.js'
import { Result, ResultInput } from '../../../common/result.js'

export type FluidConversionRecipeDefinition = RecipeDefinition &
   Readonly<{
      input: Ingredient
      output: string
   }>

export class FluidConversionRecipe extends Recipe<FluidConversionRecipeDefinition> {
   private readonly output: Result

   constructor(definition: FluidConversionRecipeDefinition) {
      super(definition)
      this.output = { fluid: this.definition.output }
   }

   getIngredients(): IngredientInput[] {
      return [this.definition.input]
   }

   getResults(): ResultInput[] {
      return [this.output]
   }

   replaceIngredient(replace: Replacer<Ingredient>): Recipe {
      return new FluidConversionRecipe({
         ...this.definition,
         input: replace(this.definition.input),
      })
   }

   replaceResult(replace: Replacer<Result>): Recipe {
      const replaced = replace(this.output)
      return new FluidConversionRecipe({
         ...this.definition,
         output: 'fluid' in replaced ? replaced.fluid : this.definition.output,
      })
   }
}

export default class FluidConversionRecipeParser extends RecipeParser<
   FluidConversionRecipeDefinition,
   FluidConversionRecipe
> {
   create(definition: FluidConversionRecipeDefinition): FluidConversionRecipe {
      return new FluidConversionRecipe(definition)
   }
}
