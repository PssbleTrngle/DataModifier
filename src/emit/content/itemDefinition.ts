import { Id, IdInput, prefix } from '../../common/id.js'
import CustomEmitter from '../custom.js'
import { ItemDefinition, ItemProperties } from '../../schema/content/itemDefinition.js'
import { ModelRulesGroup } from '../assets/models.js'
import { BlockDefinition } from '../../schema/content/blockDefinition.js'
import { ClearableEmitter } from '../index.js'
import { Acceptor } from '@pssbletrngle/pack-resolver'
import createInnerBlockDefinitionBuilder, { BlockDefinitionRulesWithoutId } from './innerBlockDefinition.js'
import { BlockstateRules } from '../assets/blockstates.js'
import { LootRules } from '../data/loot.js'

export type ItemDefinitionOptions = Readonly<{
   model?: boolean
}>

type ExtendedItemProperties = ItemProperties & {
   type?: string
}

type BlockDefinitionInput = BlockDefinition | ((rules: BlockDefinitionRulesWithoutId) => BlockDefinition)

export interface ItemDefinitionRules {
   add<T extends ItemDefinition>(id: IdInput, definition: T): T

   basic(id: IdInput, properties?: ExtendedItemProperties, options?: ItemDefinitionOptions): ItemDefinition

   blockItem(
      id: IdInput,
      properties?: ExtendedItemProperties & {
         block: BlockDefinitionInput
      },
      options?: ItemDefinitionOptions
   ): ItemDefinition
}

export default class ItemDefinitionEmitter implements ItemDefinitionRules, ClearableEmitter {
   private readonly custom = new CustomEmitter<ItemDefinition>(this.filePath)

   private readonly blockBuilder: BlockDefinitionRulesWithoutId

   constructor(private readonly models: ModelRulesGroup, blockstates: BlockstateRules, loot: LootRules) {
      this.blockBuilder = createInnerBlockDefinitionBuilder(models.blocks, blockstates, loot)
   }

   private filePath(id: Id) {
      return `content/${id.namespace}/item/${id.path}.json`
   }

   add<T extends ItemDefinition>(id: IdInput, definition: T) {
      this.custom.add(id, definition)
      return definition
   }

   clear() {
      this.custom.clear()
   }

   emit(acceptor: Acceptor) {
      return this.custom.emit(acceptor)
   }

   basic(id: IdInput, { type, ...properties }: ExtendedItemProperties = {}, options?: ItemDefinitionOptions) {
      if (options?.model !== false) this.models.items.flat(id)

      return this.add(id, {
         type: type ?? 'basic',
         properties,
      })
   }

   private createBlockDefinition(input: BlockDefinitionInput) {
      if (typeof input !== 'function') return input
      return input(this.blockBuilder)
   }

   blockItem(
      id: IdInput,
      {
         block,
         type,
         ...properties
      }: ExtendedItemProperties & {
         block: BlockDefinitionInput
      },
      options?: ItemDefinitionOptions
   ) {
      if (options?.model !== false) {
         const parent = prefix(id, 'block')
         this.models.items.add(id, { parent })
      }

      const blockDefinition = this.createBlockDefinition(block)

      return this.add(id, {
         type: type ?? 'block_item',
         block: blockDefinition,
         properties,
      })
   }
}
