import { Id, IdInput } from '../../common/id.js'
import CustomEmitter from '../custom.js'
import { BlockDefinition, BlockProperties } from '../../schema/content/blockDefinition.js'
import { ModelRules } from '../assets/models.js'
import { BlockstateRules } from '../assets/blockstates.js'
import { LootRules } from '../data/loot.js'
import { ClearableEmitter } from '../index.js'
import { Acceptor } from '@pssbletrngle/pack-resolver'

export type BlockDefinitionOptions = Readonly<{
   blockstate?: boolean
   model?: boolean
   loot?: boolean
}>

type ExtendedBlockProperties = BlockProperties & {
   type?: string
}

export interface BlockDefinitionRules {
   add<T extends BlockDefinition>(id: IdInput, definition: T): T

   basic(id: IdInput, properties: ExtendedBlockProperties, options?: BlockDefinitionOptions): BlockDefinition
}

export abstract class AbstractBlockDefinitionRules implements BlockDefinitionRules {
   constructor(
      private readonly models: ModelRules,
      private readonly blockstates: BlockstateRules,
      private readonly loot: LootRules
   ) {}

   abstract add<T extends BlockDefinition>(id: IdInput, definition: T): T

   basic(id: IdInput, { type, ...properties }: ExtendedBlockProperties, options?: BlockDefinitionOptions) {
      if (options?.model !== false) this.models.cubeAll(id)

      if (options?.blockstate !== false) this.blockstates.basic(id)

      if (options?.loot !== false) this.loot.block(id)

      return this.add(id, {
         type: type ?? 'basic',
         properties,
      })
   }
}

export default class BlockDefinitionEmitter extends AbstractBlockDefinitionRules implements ClearableEmitter {
   private readonly custom = new CustomEmitter<BlockDefinition>(this.filePath)

   private filePath(id: Id) {
      return `content/${id.namespace}/block/${id.path}.json`
   }

   add<T extends BlockDefinition>(id: IdInput, definition: T) {
      this.custom.add(id, definition)
      return definition
   }

   emit(acceptor: Acceptor) {
      return this.custom.emit(acceptor)
   }

   clear() {
      this.custom.clear()
   }
}
