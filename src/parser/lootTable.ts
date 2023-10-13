import { extendLootEntry, LootEntry, LootEntryBase, LootEntrySchema, LootTable } from '../schema/loot.js'
import { IllegalShapeError } from '../error.js'
import { IngredientInput, ItemTag, Predicate } from '../common/ingredient.js'
import { Item } from '../common/result.js'

export type LootItemInput = Item | ItemTag | LootEntry

export function createLootEntry(input: LootItemInput): LootEntry {
   if (input && typeof input === 'object') {
      if ('type' in input) return LootEntrySchema.parse(input)

      if ('tag' in input)
         return {
            type: 'minecraft:tag',
            name: input.tag,
         }
      if ('item' in input)
         return {
            type: 'minecraft:tag',
            name: input.item,
         }
   }

   throw new IllegalShapeError('unknown loot entry input', input)
}

export function replaceItemInEntry(predicate: Predicate<IngredientInput>, to: LootEntry) {
   const replace = (base: LootEntryBase): LootEntry => {
      const entry = extendLootEntry(base)
      const shared: Omit<LootEntryBase, 'type'> = { functions: entry.functions, conditions: entry.conditions }
      switch (entry.type) {
         case 'minecraft:alternatives':
            return {
               ...entry,
               children: entry.children.map(replace),
            }

         case 'minecraft:item':
            return predicate({ item: entry.name }) ? { ...shared, ...to } : entry

         case 'minecraft:tag':
            return predicate({ tag: entry.name }) ? { ...shared, ...to } : entry

         default:
            return entry
      }
   }

   return replace
}

export function replaceItemInTable(predicate: Predicate<IngredientInput>, to: LootEntry) {
   const replaceEntry = replaceItemInEntry(predicate, to)
   return (table: LootTable): LootTable => {
      return {
         ...table,
         pools: table.pools.map(pool => ({
            ...pool,
            entries: pool.entries.map(replaceEntry),
         })),
      }
   }
}
