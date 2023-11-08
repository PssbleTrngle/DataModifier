import RegistryLookup from './index.js'
import { NormalizedId } from '../../common/id.js'
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
}
