import { encodeId, Id, IdInput, NormalizedId, prefix } from '../../common/id.js'
import CustomEmitter from '../custom.js'
import { Model } from '../../schema/assets/model.js'
import { ClearableEmitter } from '../index.js'
import { Acceptor } from '@pssbletrngle/pack-resolver'

export interface ModelRules {
   fileId(type: string, id: IdInput): NormalizedId

   add(type: string, id: IdInput, blockstate: Model): NormalizedId
}

export default class ModelEmitter implements ModelRules, ClearableEmitter {
   private readonly custom = new CustomEmitter<Model>(this.filePath)

   private filePath(id: Id) {
      return `assets/${id.namespace}/models/${id.path}.json`
   }

   add(type: string, id: IdInput, model: Model) {
      const fileId = this.fileId(type, id)
      this.custom.add(fileId, model)
      return encodeId(fileId)
   }

   fileId(type: string, id: IdInput): NormalizedId {
      return prefix(id, type)
   }

   emit(acceptor: Acceptor) {
      return this.custom.emit(acceptor)
   }

   clear() {
      this.custom.clear()
   }
}
