import { Acceptor } from '@pssbletrngle/pack-resolver'
import { toJson } from '../textHelper'
import { createId, IdInput } from '../common/id'
import Registry from '../common/registry'
import { PathProvider } from './index'

export default class CustomEmitter<TEntry> {
   constructor(private readonly pathProvider: PathProvider) {}

   protected addCustom(id: IdInput, value: TEntry) {
      this.customEntries.set(createId(id), value)
   }

   private customEntries = new Registry<TEntry>()

   clear() {
      this.customEntries.clear()
   }

   add(id: IdInput, value: TEntry) {
      this.customEntries.set(createId(id), value)
   }

   async emit(acceptor: Acceptor) {
      this.customEntries.forEach((entry, id) => {
         const path = this.pathProvider(id)
         acceptor(path, toJson(entry))
      })
   }

   has(id: IdInput) {
      return this.customEntries.has(id)
   }
}
