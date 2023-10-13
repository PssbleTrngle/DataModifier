import Rule, { Modifier } from './index.js'
import { extendLootEntry, LootEntryBase, LootTable } from '../schema/loot.js'
import { encodeId, Id } from '../common/id.js'
import { Logger } from '../logger.js'
import { IngredientInput, Predicate } from '../common/ingredient.js'

function entryMatches(test: Predicate<IngredientInput>, base: LootEntryBase): boolean {
   const entry = extendLootEntry(base)
   switch (entry.type) {
      case 'minecraft:alternatives':
         return entry.children.some(it => entryMatches(test, it))
      case 'minecraft:item':
         return test({ item: entry.name })
      case 'minecraft:tag':
         return test({ tag: entry.name })
      default:
         return false
   }
}

function hasOutput(test: Predicate<IngredientInput>, table: LootTable): boolean {
   return table.pools.some(pool =>
      pool.entries.some(entry => {
         return entryMatches(test, entry)
      })
   )
}

export default class LootTableRule extends Rule<LootTable> {
   constructor(
      private readonly idTests: Predicate<Id>[],
      private readonly outputTests: Predicate<IngredientInput>[],
      modifier: Modifier<LootTable>
   ) {
      super(modifier)
   }

   matches(id: Id, table: LootTable, logger: Logger): boolean {
      const prefixed = logger.group(encodeId(id))
      return this.idTests.every(test => test(id, prefixed)) && this.outputTests.every(test => hasOutput(test, table))
   }
}
