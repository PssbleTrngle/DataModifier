import { Id } from '../common/id.js'
import { Acceptor } from '@pssbletrngle/pack-resolver'

export interface RegistryProvider<T> {
   forEach(consumer: (recipe: T, id: Id) => void): void
}

export type PathProvider = (id: Id) => string

export interface ClearableEmitter {
   clear(): void

   emit(acceptor: Acceptor): Promise<void>
}