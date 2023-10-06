import { Logger, wrapLogMethods } from '../../src/logger'

export interface TestLogger extends Logger {
   hasError(): boolean
   hasWarning(): boolean
   hasInfo(): boolean
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

   logger.hasError = () => !!errors.length
   logger.hasWarning = () => !!warnings.length
   logger.hasInfo = () => !!infoMessages.length

   return logger
}
