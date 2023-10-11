import zod from 'zod'
import { IllegalShapeError } from '../error'

export const ItemSchema = zod.object({
   item: zod.string(),
})

export type Item = zod.infer<typeof ItemSchema>

export const FluidSchema = zod.object({
   fluid: zod.string(),
})

export type Fluid = zod.infer<typeof FluidSchema>

export const ItemStackSchema = ItemSchema.and(
   zod.object({
      count: zod.number().optional(),
   })
)

export type ItemStack = zod.infer<typeof ItemStackSchema>

export const FluidStackSchema = FluidSchema.and(
   zod.object({
      amount: zod.number().optional(),
   })
)

export type FluidStack = zod.infer<typeof FluidStackSchema>

export const BlockSchema = zod.object({
   block: zod.string(),
   weight: zod.number().optional(),
})

export type Block = zod.infer<typeof BlockSchema>

export type Result = ItemStack | FluidStack | Block
export type ResultInput = Result | string

export function createResult(input: ResultInput): Result {
   if (!input) throw new IllegalShapeError('result input may not be null')

   if (typeof input === 'string') return { item: input }

   if ('item' in input) return ItemStackSchema.parse(input)
   if ('fluid' in input) return FluidStackSchema.parse(input)
   if ('block' in input) return BlockSchema.parse(input)

   throw new IllegalShapeError(`unknown result shape`, input)
}
