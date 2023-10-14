import RecipeParser, { Recipe, replaceOrKeep } from '../index.js'
import { IngredientInput, Predicate } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { ResultInput } from '../../../common/result.js'
import { IllegalShapeError } from '../../../error.js'

type ExtractionBlockInput = string

export type TreeExtractionRecipeDefinition = RecipeDefinition &
   Readonly<{
      leaves: ExtractionBlockInput
      trunk: ExtractionBlockInput
      result: ResultInput
   }>

function blockToIngredient(input: ExtractionBlockInput): IngredientInput {
   if (typeof input !== 'string') throw new IllegalShapeError('unknown block input shape', input)
   return {
      block: input,
   }
}

function ingredientToBlock(input: IngredientInput): ExtractionBlockInput {
   if (input && typeof input === 'object') {
      if ('block' in input) return input.block
   }
   throw new IllegalShapeError('unknown block input shape', input)
}

export class TreeExtractionRecipe extends Recipe<TreeExtractionRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [blockToIngredient(this.definition.leaves), blockToIngredient(this.definition.trunk)]
   }

   getResults(): ResultInput[] {
      return []
   }

   replaceIngredient(from: Predicate<IngredientInput>, to: IngredientInput): Recipe {
      return new TreeExtractionRecipe({
         ...this.definition,
         leaves: ingredientToBlock(replaceOrKeep(from, to, this.definition.leaves)),
         trunk: ingredientToBlock(replaceOrKeep(from, to, this.definition.trunk)),
      })
   }

   replaceResult(): TreeExtractionRecipe {
      return new TreeExtractionRecipe(this.definition)
   }
}

export default class TreeExtractionRecipeParser extends RecipeParser<
   TreeExtractionRecipeDefinition,
   TreeExtractionRecipe
> {
   create(definition: TreeExtractionRecipeDefinition): TreeExtractionRecipe | null {
      return new TreeExtractionRecipe(definition)
   }
}
