import { Logger } from '../logger'
import TagsLoader from '../loader/tags'
import { LootTable, LootTableSchema } from '../schema/loot'
import { Acceptor } from '@pssbletrngle/pack-resolver'
import RuledEmitter from './ruled'
import CustomEmitter from './custom'
import { Id, IdInput } from '../common/id'
import LootTableRule from '../rule/lootTable'
import { RegistryProvider } from './index'
import { Predicate } from '../common/ingredient'

export const EMPTY_LOOT_TABLE: LootTable = {
   type: 'minecraft:empty',
   pools: [],
}

type LootTableTest = Predicate<Id>

export interface LootRules {
   //  replace(test: IngredientTest, to: Item | ItemTag): void

   addLootTable(id: IdInput, value: LootTable): void

   removeLootTable(test: LootTableTest): void
}

export default class LootTableEmitter implements LootRules {
   private readonly custom = new CustomEmitter<LootTable>(this.lootPath)

   private readonly ruled = new RuledEmitter<LootTable, LootTableRule>(
      this.logger,
      this.lootTables,
      this.lootPath,
      EMPTY_LOOT_TABLE,
      id => this.custom.has(id)
   )

   constructor(
      private readonly logger: Logger,
      private readonly lootTables: RegistryProvider<LootTable>,
      private readonly tags: TagsLoader
   ) {}

   private lootPath(id: Id) {
      return `data/${id.namespace}/loot_tables/${id.path}.json`
   }

   async emit(acceptor: Acceptor) {
      await Promise.all([this.ruled.emit(acceptor), this.custom.emit(acceptor)])
   }

   addLootTable(id: IdInput, value: LootTable): void {
      this.custom.add(id, LootTableSchema.parse(value))
   }

   removeLootTable(test: LootTableTest): void {
      this.ruled.addRule(new LootTableRule([test], () => null))
   }

   clear() {
      this.custom.clear()
      this.ruled.clear()
   }
}
