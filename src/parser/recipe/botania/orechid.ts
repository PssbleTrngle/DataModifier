import RecipeParser, { Recipe, Replacer } from '../index.js'
import { BlockTag, createIngredient, IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { encodeId } from '../../../common/id.js'
import { Block, createResult, ResultInput } from '../../../common/result.js'
import { IllegalShapeError } from '../../../error.js'

export type BlockOutput =
   | string
   | Readonly<{
        name: string
     }>

export type BlockInput =
   | Readonly<{
        type: 'block'
        block: string
        weight?: number
     }>
   | Readonly<{
        type: 'tag'
        tag: string
        weight?: number
     }>

export type OrechidRecipeDefinition = RecipeDefinition &
   Readonly<{
      input: BlockInput
      output: BlockInput
      result: ResultInput
   }>

export function createBlockInput(input: IngredientInput): BlockInput | null {
   const ingredient = createIngredient(input)

   if ('block' in ingredient)
      return {
         type: 'block',
         block: ingredient.block,
         weight: ingredient.weight,
      }

   if ('blockTag' in ingredient)
      return {
         type: 'tag',
         tag: ingredient.blockTag,
         weight: ingredient.weight,
      }

   return null
}

export function createBlockOutput(input: ResultInput): BlockOutput | null {
   const result = createResult(input)
   if ('block' in result)
      return {
         name: result.block,
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
         throw new IllegalShapeError(`Unknown block input type`, input)
   }
}

export function fromBlockOutput(output: BlockOutput): Block {
   const name = typeof output === 'string' ? output : output.name
   return {
      block: encodeId(name),
   }
}

export class OrechidRecipe extends Recipe<OrechidRecipeDefinition> {
   getIngredients(): IngredientInput[] {
      return [fromBlockInput(this.definition.input)]
   }

   getResults(): ResultInput[] {
      return [fromBlockInput(this.definition.output) as Block]
   }

   replaceIngredient(replace: Replacer<IngredientInput>): Recipe {
      return new OrechidRecipe({
         ...this.definition,
         input: createBlockInput(replace(fromBlockInput(this.definition.input))) ?? this.definition.input,
      })
   }

   replaceResult(replace: Replacer<ResultInput>): Recipe {
      return new OrechidRecipe({
         ...this.definition,
         output:
            createBlockInput(replace(fromBlockInput(this.definition.output) as ResultInput)) ?? this.definition.output,
      })
   }
}

export default class OrechidRecipeParser extends RecipeParser<OrechidRecipeDefinition, OrechidRecipe> {
   create(definition: OrechidRecipeDefinition): OrechidRecipe {
      return new OrechidRecipe(definition)
   }
}
