import zod from 'zod'
import { IllegalShapeError } from '../error.js'
import { RegistryLookup } from '../loader/registryDump.js'

export const ItemStackSchema = zod.object({
   item: zod.string(),
   count: zod.number().optional(),
   chance: zod.number().optional(),
})

export const FluidStackSchema = zod.object({
   fluid: zod.string(),
   amount: zod.number().optional(),
   chance: zod.number().optional(),
})

export type ItemStack = zod.infer<typeof ItemStackSchema>

export type FluidStack = zod.infer<typeof FluidStackSchema>

export const BlockSchema = zod.object({
   block: zod.string(),
})

export type Block = zod.infer<typeof BlockSchema>

export type Result = ItemStack | FluidStack | Block
export type ResultInput = Result | string

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
