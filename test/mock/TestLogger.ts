import { Logger, wrapLogMethods } from '../../src/logger'

export interface TestLogger extends Logger {
   errors(): ReadonlyArray<unknown>
   warnings(): ReadonlyArray<unknown>
   infoMessages(): ReadonlyArray<unknown>
}

export default function createTestLogger(): TestLogger {
   const errors: unknown[][] = []
   const warnings: unknown[][] = []
   const infoMessages: unknown[][] = []

   const logger = wrapLogMethods({
      error: (...args) => errors.push(args),
      warn: (...args) => warnings.push(args),
      info: (...args) => infoMessages.push(args),
   }) as TestLogger

   logger.errors = () => errors
   logger.warnings = () => warnings
   logger.infoMessages = () => infoMessages

   return logger
}
