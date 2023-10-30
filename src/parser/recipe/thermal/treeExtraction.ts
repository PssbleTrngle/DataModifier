import RecipeParser, { Recipe, Replacer } from '../index.js'
import { Ingredient, IngredientInput } from '../../../common/ingredient.js'
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

function blockToIngredient(input: ExtractionBlockInput): Ingredient {
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
   private readonly trunk
   private readonly leaves

   constructor(definition: TreeExtractionRecipeDefinition) {
      super(definition)
      this.trunk = blockToIngredient(definition.trunk)
      this.leaves = blockToIngredient(definition.leaves)
   }

   getIngredients(): IngredientInput[] {
      return [this.trunk, this.leaves]
   }

   getResults(): ResultInput[] {
      return []
   }

   replaceIngredient(replace: Replacer<Ingredient>): Recipe {
      return new TreeExtractionRecipe({
         ...this.definition,
         leaves: ingredientToBlock(replace(this.leaves)),
         trunk: ingredientToBlock(replace(this.trunk)),
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
   create(definition: TreeExtractionRecipeDefinition): TreeExtractionRecipe {
      return new TreeExtractionRecipe(definition)
   }
}
