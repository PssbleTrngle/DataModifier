import { Acceptor } from '@pssbletrngle/pack-resolver'
import { encodeId, Id, IdInput, NormalizedId, prefix } from '../../common/id.js'
import {
   CommonTest,
   IngredientInput,
   IngredientTest,
   Predicate,
   resolveIngredientTest,
} from '../../common/ingredient.js'
import { resolveIDTest } from '../../common/predicates.js'
import RegistryLookup from '../../loader/registry/index.js'
import { TagRegistryHolder } from '../../loader/tags.js'
import { Logger } from '../../logger.js'
import { createLootEntry, LootItemInput, replaceItemInTable } from '../../parser/lootTable.js'
import LootTableRule from '../rule/lootTable.js'
import { EmptyLootEntry, LootModifier, LootTable, LootTableSchema } from '../../schema/data/loot.js'
import CustomEmitter from '../custom.js'
import { ClearableEmitter, RegistryProvider } from '../index.js'
import RuledEmitter from '../ruled.js'

export const EMPTY_LOOT_TABLE: LootTable = {
   type: 'minecraft:empty',
   pools: [],
}

export const EMPTY_LOOT_MODIFIER: LootModifier = {
   type: 'noop',
}

type LootTableTest = Readonly<{
   id?: CommonTest<NormalizedId>
   output?: IngredientTest
}>

export interface LootRules {
   replaceOutput(from: IngredientTest, to: LootItemInput, additionalTests?: LootTableTest): void

   removeOutput(from: IngredientTest, additionalTests?: LootTableTest): void

   add(id: IdInput, value: LootTable): void

   disable(test: LootTableTest): void

   block(id: IdInput): void

   addModifier<T extends LootModifier>(id: IdInput, value: T): void

   disabledModifier(id: IdInput): void
}

export default class LootTableEmitter implements LootRules, ClearableEmitter {
   private readonly customTables = new CustomEmitter<LootTable>(this.tablePath)
   private readonly customModifiers = new CustomEmitter<LootModifier>(this.modifierPath)

   private readonly ruled = new RuledEmitter<LootTable, LootTableRule>(
      this.logger,
      this.lootTables,
      this.tablePath,
      EMPTY_LOOT_TABLE,
      id => this.customTables.has(id)
   )

   constructor(
      private readonly logger: Logger,
      private readonly lootTables: RegistryProvider<LootTable>,
      private readonly tags: TagRegistryHolder,
      private readonly lookup: () => RegistryLookup
   ) {}

   private tablePath(id: Id) {
      return `data/${id.namespace}/loot_tables/${id.path}.json`
   }

   private modifierPath(id: Id) {
      return `data/${id.namespace}/loot_modifiers/${id.path}.json`
   }

   clear() {
      this.customTables.clear()
      this.customModifiers.clear()
      this.ruled.clear()
   }

   async emit(acceptor: Acceptor) {
      await Promise.all([
         this.ruled.emit(acceptor),
         this.customTables.emit(acceptor),
         this.customModifiers.emit(acceptor),
      ])
   }

   resolveIngredientTest(test: IngredientTest) {
      return resolveIngredientTest(test, this.tags, this.lookup())
   }

   private resolveLootTableTest(test: LootTableTest) {
      const id: Predicate<Id>[] = []
      const output: Predicate<IngredientInput>[] = []

      if (test.id) id.push(resolveIDTest(test.id))
      if (test.output) output.push(this.resolveIngredientTest(test.output))

      return { id, output }
   }

   add(id: IdInput, value: LootTable): void {
      this.customTables.add(id, LootTableSchema.parse(value))
   }

   disable(test: LootTableTest): void {
      const predicates = this.resolveLootTableTest(test)
      this.ruled.addRule(new LootTableRule(predicates.id, predicates.output, () => null))
   }

   replaceOutput(from: IngredientTest, to: LootItemInput, additionalTests: LootTableTest = {}): void {
      const predicates = this.resolveLootTableTest(additionalTests)
      const outputPredicate = this.resolveIngredientTest(from)
      const replacer = replaceItemInTable(outputPredicate, createLootEntry(to, this.lookup()))
      this.ruled.addRule(new LootTableRule(predicates.id, [outputPredicate, ...predicates.output], replacer))
   }

   removeOutput(from: IngredientTest, additionalTests?: LootTableTest) {
      this.replaceOutput(from, EmptyLootEntry, additionalTests)
   }

   block(id: IdInput) {
      this.add(prefix(id, 'blocks/'), {
         type: 'minecraft:block',
         pools: [
            {
               rolls: 1,
               entries: [
                  {
                     type: 'minecraft:item',
                     name: encodeId(id),
                  },
               ],
               conditions: [
                  {
                     condition: 'minecraft:survives_explosion',
                  },
               ],
            },
         ],
      })
   }

   disabledModifier(id: IdInput) {
      this.addModifier(id, EMPTY_LOOT_MODIFIER)
   }

   addModifier<T extends LootModifier>(id: IdInput, value: T) {
      this.customModifiers.add(id, value)
   }
}
