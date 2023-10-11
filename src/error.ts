import { Logger } from './logger'

export class IllegalShapeError extends Error {
   constructor(message: string, readonly input?: any) {
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

      // TODO catch zod errors?

      throw error
   }
}
