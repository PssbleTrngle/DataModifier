import { Id, IdInput } from '../../common/id.js'
import CustomEmitter from '../custom.js'
import { ItemDefinition, ItemProperties } from '../../schema/content/itemDefinition.js'
import { ModelRules } from '../assets/models.js'
import { BlockDefinition } from '../../schema/content/blockDefinition.js'
import { ClearableEmitter } from '../index.js'
import { Acceptor } from '@pssbletrngle/pack-resolver'
import { AbstractBlockDefinitionRules, BlockDefinitionRules } from './blockDefinition'
import { mapValues } from 'lodash-es'

export type ItemDefinitionOptions = Readonly<{
   model?: boolean
}>

type ExtendedItemProperties = ItemProperties & {
   type?: string
}

export interface ItemDefinitionRules {
   add<T extends ItemDefinition>(id: IdInput, definition: T): T

   basic(id: IdInput, properties?: ExtendedItemProperties, options?: ItemDefinitionOptions): ItemDefinition

   blockItem(
      id: IdInput,
      properties?: ExtendedItemProperties & {
         block: BlockDefinition
      },
      options?: ItemDefinitionOptions
   ): ItemDefinition
}

class InnerBlockDefinitionRules extends AbstractBlockDefinitionRules {
   private last: BlockDefinition | null = null

   add<T extends BlockDefinition>(id: IdInput, definition: T): T {
      this.last = definition
      return definition
   }

   build() {
      if (this.last === null) throw new Error('missing block definition')
      return this.last
   }
}

type SlicedArguments<T> = T extends (sliced: unknown, ...args: infer A) => unknown
   ? (...args: A) => ReturnType<T>
   : never

type BlockDefinitionRulesWithoutId = {
   [K in keyof BlockDefinitionRules]: SlicedArguments<BlockDefinitionRules[K]>
}

const t = {} as unknown as BlockDefinitionRulesWithoutId

function createdSlicedEmitter(emitter: BlockDefinitionRules) {
   return mapValues(emitter, prop => {
      if (typeof prop !== 'function') return prop
      const sliced: SlicedArguments<typeof prop> = (...args: unknown[]) => (prop as any)('', ...args)
      return sliced
   }) as BlockDefinitionRulesWithoutId
}

export default class ItemDefinitionEmitter implements ItemDefinitionRules, ClearableEmitter {
   private readonly custom = new CustomEmitter<ItemDefinition>(this.filePath)

   constructor(private readonly models: ModelRules) {}

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
      if (options?.model !== false) {
         const texture = this.models.fileId('item', id)
         this.models.add('item', id, {
            parent: 'minecraft:item/generated',
            textures: {
               layer0: texture,
            },
         })
      }

      return this.add(id, {
         type: type ?? 'basic',
         properties,
      })
   }

   blockItem(
      id: IdInput,
      {
         block,
         type,
         ...properties
      }: ExtendedItemProperties & {
         block: BlockDefinition
      },
      options?: ItemDefinitionOptions
   ) {
      if (options?.model !== false) {
         const parent = this.models.fileId('block', id)
         this.models.add('item', id, {
            parent,
         })
      }

      return this.add(id, {
         type: type ?? 'block_item',
         block,
         properties,
      })
   }
}
