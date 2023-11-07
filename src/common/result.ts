import zod from 'zod'
import { IllegalShapeError } from '../error.js'
import RegistryLookup from '../loader/registry/index.js'
import { ZodType } from 'zod/lib/types'
import { BlockId, FluidId, ItemId } from '../schema/ids'

export const ItemStackSchema = zod.object({
   item: zod.string() as ZodType<ItemId>,
   count: zod.number().int().optional(),
   chance: zod.number().optional(),
})

export type ItemStack = zod.infer<typeof ItemStackSchema>

export const FluidStackSchema = zod.object({
   fluid: zod.string() as ZodType<FluidId>,
   amount: zod.number().optional(),
   chance: zod.number().optional(),
})

export type FluidStack = zod.infer<typeof FluidStackSchema>

export const BlockSchema = zod.object({
   block: zod.string() as ZodType<BlockId>,
})

export type Block = zod.infer<typeof BlockSchema>

export type Result = ItemStack | FluidStack | Block
export type ResultInput = Result | ItemId

function createUnvalidatedResult(input: unknown): Result {
   if (!input) throw new IllegalShapeError('result input may not be null')

   if (typeof input === 'string') return { item: input }

   if (typeof input === 'object') {
      if ('item' in input) return ItemStackSchema.parse(input)
      if ('fluid' in input) return FluidStackSchema.parse(input)
      if ('block' in input) return BlockSchema.parse(input)
   }

   throw new IllegalShapeError(`unknown result shape`, input)
}

export function createResult(input: unknown, lookup?: RegistryLookup): Result {
   const unvalidated = createUnvalidatedResult(input)
   lookup?.validate(unvalidated)
   return unvalidated
}
