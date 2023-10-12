import { Id } from '../common/id'

export interface RegistryProvider<T> {
   forEach(consumer: (recipe: T, id: Id) => void): void
}

export type PathProvider = (id: Id) => string
