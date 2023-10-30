import RecipeParser, { Recipe, Replacer } from '../index.js'
import { BlockIngredient, createIngredient, Ingredient, IngredientInput } from '../../../common/ingredient.js'
import { RecipeDefinition } from '../../../schema/recipe.js'
import { encodeId } from '../../../common/id.js'
import { Block, createResult, Result, ResultInput } from '../../../common/result.js'
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
     }>
   | Readonly<{
        type: 'tag'
        tag: string
     }>

export type OrechidRecipeDefinition = RecipeDefinition &
   Readonly<{
      input: BlockInput
      output: BlockInput
      biome_bonus?: number
      biome_bonus_tag?: string
      weight?: number
   }>

export function createBlockInput(input: IngredientInput): BlockInput | null {
   const ingredient = createIngredient(input)

   if ('block' in ingredient)
      return {
         type: 'block',
         block: ingredient.block,
      }

   if ('blockTag' in ingredient)
      return {
         type: 'tag',
         tag: ingredient.blockTag,
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

export function fromBlockInput(input: BlockInput): BlockIngredient {
   switch (input.type) {
      case 'block':
         return {
            block: encodeId(input.block),
         }
      case 'tag':
         return {
            blockTag: encodeId(input.tag),
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

   replaceIngredient(replace: Replacer<Ingredient>): Recipe {
      return new OrechidRecipe({
         ...this.definition,
         input: createBlockInput(replace(fromBlockInput(this.definition.input))) ?? this.definition.input,
      })
   }

   replaceResult(replace: Replacer<Result>): Recipe {
      return new OrechidRecipe({
         ...this.definition,
         output: createBlockInput(replace(fromBlockInput(this.definition.output) as Block)) ?? this.definition.output,
      })
   }
}

export default class OrechidRecipeParser extends RecipeParser<OrechidRecipeDefinition, OrechidRecipe> {
   create(definition: OrechidRecipeDefinition): OrechidRecipe {
      return new OrechidRecipe(definition)
   }
}
