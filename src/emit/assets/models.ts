import { encodeId, IdInput, NormalizedId, prefix } from '../../common/id.js'
import CustomEmitter from '../custom.js'
import { Model } from '../../schema/assets/model.js'
import { ClearableEmitter } from '../index.js'
import { Acceptor } from '@pssbletrngle/pack-resolver'

export interface ModelRules {
   add(id: IdInput, blockstate: Model): NormalizedId

   cubeAll(id: IdInput, texture?: string): NormalizedId

   flat(id: IdInput, texture?: string): NormalizedId

   cog(id: IdInput, large: boolean, texture?: string): NormalizedId
}

export interface ModelRulesGroup {
   blocks: ModelRules
   items: ModelRules
}

export default class ModelEmitter implements ModelRules, ClearableEmitter {
   private readonly custom

   constructor(type: string) {
      this.custom = new CustomEmitter<Model>(id => `assets/${id.namespace}/models/${type}/${id.path}.json`)
   }

   add(id: IdInput, model: Model) {
      this.custom.add(id, model)
      return encodeId(id)
   }

   emit(acceptor: Acceptor) {
      return this.custom.emit(acceptor)
   }

   clear() {
      this.custom.clear()
   }

   cubeAll(id: IdInput, texture = prefix(id, 'block')) {
      return this.add(id, {
         parent: 'minecraft:block/cube_all',
         textures: {
            all: texture,
         },
      })
   }

   flat(id: IdInput, texture = prefix(id, 'item')) {
      return this.add(id, {
         parent: 'minecraft:item/generated',
         textures: {
            layer0: texture,
         },
      })
   }

   cog(id: IdInput, large: boolean, texture = prefix(id, 'block')) {
      if (large) {
         return this.add(id, {
            parent: 'create:block/large_cogwheel',
            textures: {
               '4': texture,
               particle: texture,
            },
         })
      } else {
         return this.add(id, {
            parent: 'create:block/cogwheel',
            textures: {
               '1_2': texture,
               particle: texture,
            },
         })
      }
   }
}
