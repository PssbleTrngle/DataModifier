import zod from 'zod'

const NumberProviderSchema = zod.union([
   zod.number(),
   zod.object({
      type: zod.string().optional(),
   }),
])

const LootConditionSchema = zod.object({
   condition: zod.string(),
})

const LootFunctionSchema = zod.object({
   function: zod.string(),
})

const LootEntryBaseSchema = zod
   .object({
      type: zod.string(),
      conditions: zod.array(LootConditionSchema).optional(),
      functions: zod.array(LootFunctionSchema).optional(),
   })
   .passthrough()

export type LootEntryBase = zod.infer<typeof LootEntryBaseSchema>

const LootEntryAlternativeSchema = zod.object({
   type: zod.literal('minecraft:alternatives'),
   children: zod.array(LootEntryBaseSchema),
})

const LootEntryItemSchema = zod.object({
   type: zod.literal('minecraft:item'),
   name: zod.string(),
})

const LootEntryTagSchema = zod.object({
   type: zod.literal('minecraft:tag'),
   name: zod.string(),
   expand: zod.boolean().optional(),
})

const LootEntryEmptySchema = zod.object({
   type: zod.literal('minecraft:empty'),
})

export const EmptyLootEntry: LootEntry = {
   type: 'minecraft:empty',
}

const LootEntryReferenceSchema = zod.object({
   type: zod.literal('minecraft:loot_table'),
   name: zod.string(),
})

export const LootEntrySchema = LootEntryBaseSchema.and(
   zod.discriminatedUnion('type', [
      LootEntryAlternativeSchema,
      LootEntryItemSchema,
      LootEntryTagSchema,
      LootEntryReferenceSchema,
      LootEntryEmptySchema,
   ])
)

export type LootEntry = zod.infer<typeof LootEntrySchema>

export const LootPoolSchema = zod.object({
   rolls: NumberProviderSchema,
   bonus_rolls: NumberProviderSchema.optional(),
   entries: zod.array(LootEntryBaseSchema),
   conditions: zod.array(LootConditionSchema).optional(),
   functions: zod.array(LootFunctionSchema).optional(),
})

export type LootPool = zod.infer<typeof LootPoolSchema>

export const LootTableSchema = zod.object({
   type: zod.string().optional(),
   pools: zod.array(LootPoolSchema).default([]),
})

export type LootTable = zod.infer<typeof LootTableSchema>

export function extendLootEntry(base: LootEntryBase): LootEntry {
   return LootEntrySchema.parse(base)
}
