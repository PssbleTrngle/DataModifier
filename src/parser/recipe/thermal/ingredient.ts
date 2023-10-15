import { FluidTag, IngredientInput, ItemTagSchema } from '../../../common/ingredient.js'
import zod from 'zod'
import { ItemStackSchema } from '../../../common/result.js'
import { omit } from 'lodash-es'
import { IllegalShapeError } from '../../../error.js'

const ThermalFluidTagSchema = zod.object({
   fluid_tag: zod.string(),
   amount: zod.number(),
})

type ThermalFluidTag = zod.infer<typeof ThermalFluidTagSchema>

type ThermalItemList = Readonly<{
   value: ThermalIngredientInput[]
   count?: number
}>

export type ThermalIngredientInput = Exclude<IngredientInput, FluidTag> | ThermalFluidTag | ThermalItemList

function fromThermalList(input: ThermalItemList): IngredientInput {
   return input.value.map(it => {
      if (it && typeof it === 'object') {
         if ('item' in it) return { ...ItemStackSchema.parse(it), count: input.count }
         if ('tag' in it) return { ...ItemTagSchema.parse(it), count: input.count }
      }
      throw new IllegalShapeError('thermal array ingredients may only be of type item/itemtag', it)
   })
}

export function fromThermalIngredient(input: ThermalIngredientInput): IngredientInput {
   if (input && typeof input === 'object') {
      if ('value' in input) return fromThermalList(input)

      if ('fluid_tag' in input) {
         return { ...omit(input, 'fluid_tag'), fluidTag: input.fluid_tag }
      }
   }

   return input
}

export function toThermalIngredient(input: IngredientInput): ThermalIngredientInput {
   if (input && typeof input === 'object') {
      if ('fluidTag' in input) {
         return <ThermalFluidTag>{ ...omit(input, 'fluidTag'), fluid_tag: input.fluidTag }
      }
   }

   return input
}
