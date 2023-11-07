import { Logger } from './logger.js'
import { ZodError } from 'zod'
import { InferIds, RegistryId } from './schema/ids'

export class IllegalShapeError extends Error {
   constructor(message: string, readonly input?: unknown) {
      super(message)
   }
}

export class UnknownRegistryEntry<T extends RegistryId> extends Error {
   constructor(message: string, readonly registry: T, readonly id: InferIds<T>) {
      super(message)
   }
}

export function tryCatching<T>(logger: Logger | undefined, run: () => T): T | null {
   try {
      return run()
   } catch (error) {
      if (error instanceof IllegalShapeError) {
         if (error.input) logger?.warn(error.message, error.input)
         else logger?.warn(error.message)
         return null
      }

      if (error instanceof ZodError) {
         const message = error.errors
            .map(it => {
               if (it.path) return `${it.path.join('.')}: ${it.message}`
               else return it.message
            })
            .join(', ')
         logger?.warn(`unknown shape: ${message}`)
         return null
      }

      throw error
   }
}
