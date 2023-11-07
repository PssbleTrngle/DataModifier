import RegistryLookup from './index.js'
import { NormalizedId } from '../../common/id.js'
import { RegistryId } from '@pssbletrngle/data-modifier/generated'

const emptySet = new Set<NormalizedId<never>>()

export default class EmptyRegistryLookup implements RegistryLookup {
   isKnown(): boolean {
      return false
   }

   registries(): NormalizedId<RegistryId>[] {
      return []
   }

   keys() {
      return emptySet
   }

   validate() {
      // Nothing done
   }
}
