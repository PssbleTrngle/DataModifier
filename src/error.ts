import { Logger } from './logger.js'
import { ZodError } from 'zod'

export class IllegalShapeError extends Error {
   constructor(message: string, readonly input?: unknown) {
      super(input ? `${message}: ${JSON.stringify(input)}` : message)
   }
}

export function tryCatching<T>(logger: Logger | undefined, run: () => T): T | null {
   try {
      return run()
   } catch (error) {
      if (error instanceof IllegalShapeError) {
         logger?.warn((error as Error).message)
         return null
      }

      if (error instanceof ZodError) {
         logger?.warn(`unknown shape`, error)
         return null
      }

      throw error
   }
}
