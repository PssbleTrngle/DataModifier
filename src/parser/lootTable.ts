import { extendLootEntry, LootEntry, LootEntryBase, LootTable } from '../schema/data/loot.js'
import { IllegalShapeError } from '../error.js'
import { IngredientInput, ItemIngredient, Predicate } from '../common/ingredient.js'
import RegistryLookup from '../loader/registry/index.js'

export type LootItemInput = ItemIngredient | LootEntry

function createUnvalidatedLootEntry(input: LootItemInput): LootEntry {
   if (input && typeof input === 'object') {
      if ('type' in input) return extendLootEntry(input)

      if ('tag' in input)
         return {
            type: 'minecraft:tag',
            name: input.tag,
         }

      if ('item' in input)
         return {
            type: 'minecraft:item',
            name: input.item,
         }
   }

   throw new IllegalShapeError('unknown loot entry input', input)
}

function validateLootEntry(entry: LootEntry, lookup: RegistryLookup) {
   if (entry.type === 'minecraft:item') lookup?.validate({ item: entry.name })
   if (entry.type === 'minecraft:tag') lookup?.validate({ tag: entry.name })
   if (entry.type === 'minecraft:alternatives') {
      entry.children.forEach(it => validateLootEntry(extendLootEntry(it), lookup))
   }
}

export function createLootEntry(input: LootItemInput, lookup?: RegistryLookup): LootEntry {
   const unvalidated = createUnvalidatedLootEntry(input)
   if (lookup) validateLootEntry(unvalidated, lookup)
   return unvalidated
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
