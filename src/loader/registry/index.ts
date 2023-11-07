import { IdInput, NormalizedId } from '../../common/id.js'
import { Ingredient } from '../../common/ingredient.js'
import { InferIds, RegistryId } from '../../schema/ids'

export default interface RegistryLookup {
   registries(): NormalizedId<RegistryId>[]

   keys<T extends RegistryId>(registry: IdInput<T>): ReadonlySet<NormalizedId<InferIds<T>>> | undefined

   isKnown(registry: IdInput<RegistryId>): boolean

   validate(ingredient: Ingredient): void
}
