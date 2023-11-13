import { Id, IdInput } from '../../common/id.js'
import CustomEmitter from '../custom.js'
import { Blockstate } from '../../schema/assets/blockstate.js'
import { ClearableEmitter } from '../index.js'
import { Acceptor } from '@pssbletrngle/pack-resolver'

export interface BlockstateRules {
   add(id: IdInput, blockstate: Blockstate): void
}

export default class BlockstateEmitter implements BlockstateRules, ClearableEmitter {
   private readonly custom = new CustomEmitter<Blockstate>(this.filePath)

   private filePath(id: Id) {
      return `assets/${id.namespace}/blockstates/${id.path}.json`
   }

   add(id: IdInput, blockstate: Blockstate) {
      this.custom.add(id, blockstate)
   }

   emit(acceptor: Acceptor) {
      return this.custom.emit(acceptor)
   }

   clear() {
      this.custom.clear()
   }
}
