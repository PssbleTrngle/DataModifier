// @ts-ignore
import { jest } from '@jest/globals'
import { Logger, wrapLogMethods } from '../../src/logger'

export interface TestLogger extends Logger {
   reset(): void
   info: jest.Mock
   warn: jest.Mock
   error: jest.Mock
}

export default function createTestLogger(): TestLogger {
   const logger = wrapLogMethods({
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
   }) as TestLogger

   logger.reset = () => {
      logger.info.mockReset()
      logger.warn.mockReset()
      logger.error.mockReset()
   }

   return logger
}
