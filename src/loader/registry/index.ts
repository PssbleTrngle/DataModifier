import { IdInput, NormalizedId } from '../../common/id.js'
import { Ingredient } from '../../common/ingredient.js'
import { InferIds, RegistryId } from '@pssbletrngle/data-modifier/generated'

export default interface RegistryLookup {
   registries(): NormalizedId<RegistryId>[]

   keys<T extends RegistryId>(registry: IdInput<T>): ReadonlySet<NormalizedId<InferIds<T>>> | undefined

   isKnown(registry: IdInput<RegistryId>): boolean

   validate(ingredient: Ingredient): void

   validateEntry(key: RegistryId, id: IdInput): void

   addCustom<T extends RegistryId>(key: T, id: IdInput): InferIds<T>
}
