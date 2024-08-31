import type { Mock } from 'vitest'
import { Logger, wrapLogMethods } from '../../src/logger.js'

export interface TestLogger extends Logger {
   reset(): void
   info: Mock
   warn: Mock
   error: Mock
}

export default function createTestLogger(): TestLogger {
   const logger = wrapLogMethods({
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
   }) as TestLogger

   logger.reset = () => {
      logger.info.mockReset()
      logger.warn.mockReset()
      logger.error.mockReset()
   }

   return logger
}
