import { Logger } from '../logger.js'
import TagsLoader from '../loader/tags.js'
import { EmptyLootEntry, LootTable, LootTableSchema } from '../schema/loot.js'
import { Acceptor } from '@pssbletrngle/pack-resolver'
import RuledEmitter from './ruled.js'
import CustomEmitter from './custom.js'
import { Id, IdInput, NormalizedId } from '../common/id.js'
import LootTableRule from '../rule/lootTable.js'
import { RegistryProvider } from './index.js'
import { CommonTest, IngredientInput, IngredientTest, Predicate, resolveIngredientTest } from '../common/ingredient.js'
import { resolveIDTest } from '../common/predicates.js'
import { createLootEntry, LootItemInput, replaceItemInTable } from '../parser/lootTable.js'

export const EMPTY_LOOT_TABLE: LootTable = {
   type: 'minecraft:empty',
   pools: [],
}

type LootTableTest = Readonly<{
   id?: CommonTest<NormalizedId>
   output?: IngredientTest
}>

export interface LootRules {
   replaceOutput(from: IngredientTest, to: LootItemInput, additionalTests?: LootTableTest): void

   removeOutput(from: IngredientTest, additionalTests?: LootTableTest): void

   addLootTable(id: IdInput, value: LootTable): void

   disableLootTable(test: LootTableTest): void
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

   resolveIngredientTest(test: IngredientTest) {
      return resolveIngredientTest(test, this.tags)
   }

   private resolveLootTableTest(test: LootTableTest) {
      const id: Predicate<Id>[] = []
      const output: Predicate<IngredientInput>[] = []

      if (test.id) id.push(resolveIDTest(test.id))
      if (test.output) output.push(this.resolveIngredientTest(test.output))

      return { id, output }
   }

   addLootTable(id: IdInput, value: LootTable): void {
      this.custom.add(id, LootTableSchema.parse(value))
   }

   disableLootTable(test: LootTableTest): void {
      const predicates = this.resolveLootTableTest(test)
      this.ruled.addRule(new LootTableRule(predicates.id, predicates.output, () => null))
   }

   replaceOutput(from: IngredientTest, to: LootItemInput, additionalTests: LootTableTest = {}): void {
      const predicates = this.resolveLootTableTest(additionalTests)
      const outputPredicate = this.resolveIngredientTest(from)
      const replacer = replaceItemInTable(outputPredicate, createLootEntry(to))
      this.ruled.addRule(new LootTableRule(predicates.id, [outputPredicate, ...predicates.output], replacer))
   }

   removeOutput(from: IngredientTest, additionalTests?: LootTableTest) {
      this.replaceOutput(from, EmptyLootEntry, additionalTests)
   }

   clear() {
      this.custom.clear()
      this.ruled.clear()
   }
}
