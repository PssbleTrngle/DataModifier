import RegistryLookup from './index.js'
import { encodeId, IdInput, NormalizedId } from '../../common/id.js'
import { RegistryId } from '@pssbletrngle/data-modifier/generated'

export default class EmptyRegistryLookup implements RegistryLookup {
   isKnown(): boolean {
      return false
   }

   registries(): NormalizedId<RegistryId>[] {
      return []
   }

   keys() {
      return undefined
   }

   validate() {
      // Nothing done
   }

   validateEntry() {
      // Nothing done
   }

   addCustom(key: RegistryId, id: IdInput) {
      return encodeId(id)
   }
}
