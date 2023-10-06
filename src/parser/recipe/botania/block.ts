import RecipeParser, { Recipe } from '..'
import { Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'

export type BlockOutput = Readonly<{
   type: 'block'
   block: string
   weight?: number
}>

export type BlockInput =
   | BlockOutput
   | Readonly<{
        type: 'tag'
        tag: `#${string}`
     }>

export type BlockRecipeDefinition = RecipeDefinition &
   Readonly<{
      input: BlockInput
      output: BlockOutput
      result: Result
   }>

export function createBlockInput(ingredient: Ingredient): BlockInput | null {
   if ('item' in ingredient)
      return {
         type: 'block',
         block: ingredient.item,
      }

   if ('tag' in ingredient)
      return {
         type: 'tag',
         tag: ingredient.tag,
      }

   return null
}

export function createBlockOutput(result: Result): BlockOutput | null {
   if ('item' in result)
      return {
         type: 'block',
         block: result.item,
      }

   return null
}

export function fromBlockInput(input: BlockInput): Ingredient {
   switch (input.type) {
      case 'block':
         return {
            item: input.block,
         }
      case 'tag':
         return {
            tag: input.tag,
         }
      default:
         throw new Error(`Unknown block input type ${(input as BlockInput).type}`)
   }
}

export function fromBlockOutput(output: BlockOutput): Result {
   return {
      item: output.block,
   }
}

export class BlockRecipe extends Recipe<BlockRecipeDefinition> {
   getIngredients(): Ingredient[] {
      return [fromBlockInput(this.definition.input)]
   }

   getResults(): Result[] {
      return [fromBlockOutput(this.definition.output)]
   }

   replaceIngredient(from: Predicate<Ingredient>, to: Ingredient): BlockRecipe {
      return new BlockRecipe({
         ...this.definition,
         input: createBlockInput(to) ?? this.definition.input,
      })
   }

   replaceResult(from: Predicate<Ingredient>, to: Result): BlockRecipe {
      return new BlockRecipe({
         ...this.definition,
         output: createBlockOutput(to) ?? this.definition.output,
      })
   }
}

export default class BlockRecipeParser extends RecipeParser<BlockRecipeDefinition, BlockRecipe> {
   create(definition: BlockRecipeDefinition): BlockRecipe {
      return new BlockRecipe(definition)
   }
}
