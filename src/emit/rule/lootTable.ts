import Rule, { Modifier } from './index.js'
import { extendLootEntry, LootEntryBase, LootTable } from '../../schema/data/loot.js'
import { Id } from '../../common/id.js'
import { Logger } from '../../logger.js'
import { IngredientInput, Predicate } from '../../common/ingredient.js'
import { exists } from '@pssbletrngle/pack-resolver'

function entryMatches(logger: Logger, test: Predicate<IngredientInput>, base: LootEntryBase): boolean {
   try {
      const entry = extendLootEntry(base)
      switch (entry.type) {
         case 'minecraft:alternatives':
            return entry.children.some(it => entryMatches(logger, test, it))
         case 'minecraft:item':
            return test({ item: entry.name }, logger)
         case 'minecraft:tag':
            return test({ tag: entry.name }, logger)
         default:
            return false
      }
   } catch (e) {
      logger.warn(`unknown loot entry type:`, base)
      return false
   }
}

function hasOutput(logger: Logger, test: Predicate<IngredientInput>, table: LootTable): boolean {
   return table.pools.some(pool =>
      pool.entries.some(entry => {
         return entryMatches(logger, test, entry)
      })
   )
}

export default class LootTableRule extends Rule<LootTable> {
   constructor(
      private readonly shape: unknown[],
      private readonly idTests: Predicate<Id>[],
      private readonly outputTests: Predicate<IngredientInput>[],
      modifier: Modifier<LootTable>
   ) {
      super(modifier)
   }

   matches(id: Id, table: LootTable, logger: Logger): boolean {
      const prefixed = logger
      return (
         this.idTests.every(test => test(id, prefixed)) &&
         this.outputTests.every(test => hasOutput(prefixed, test, table))
      )
   }

   printWarning(logger: Logger) {
      logger.error('Could not find any loot table matching', ...this.shape.filter(exists))
   }
}
