import RecipeParser, { Recipe } from '..'
import { Block, BlockTag, Ingredient, Predicate, Result } from '../../../common/ingredient'
import { RecipeDefinition } from '../../../schema/recipe'
import { encodeId } from '../../../common/id'

export type BlockOutput = Readonly<{
   type: 'block'
   block: string
   weight?: number
}>

export type BlockInput =
   | BlockOutput
   | Readonly<{
        type: 'tag'
        tag: string
        weight?: number
     }>

export type BlockRecipeDefinition = RecipeDefinition &
   Readonly<{
      input: BlockInput
      output: BlockOutput
      result: Result
   }>

export function createBlockInput(ingredient: Ingredient): BlockInput | null {
   const output = createBlockOutput(ingredient as Result)
   if (output) return output

   if ('blockTag' in ingredient)
      return {
         type: 'tag',
         tag: ingredient.blockTag,
         weight: ingredient.weight,
      }

   return null
}

export function createBlockOutput(result: Result): BlockOutput | null {
   if ('block' in result)
      return {
         type: 'block',
         block: result.block,
         weight: result.weight,
      }

   return null
}

export function fromBlockInput(input: BlockInput): Block | BlockTag {
   switch (input.type) {
      case 'block':
         return {
            block: encodeId(input.block),
            weight: input.weight,
         }
      case 'tag':
         return {
            blockTag: encodeId(input.tag),
            weight: input.weight,
         }
      default:
         throw new Error(`Unknown block input type ${(input as BlockInput).type}`)
   }
}

export function fromBlockOutput(output: BlockOutput): Block {
   return {
      block: encodeId(output.block),
      weight: output.weight,
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
