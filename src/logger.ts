import chalk from 'chalk'

type Logable = string | number | boolean | null | undefined
type LogMethod = (...args: Logable[]) => void

type LogMethods = {
   error: LogMethod
   warn: LogMethod
   info: LogMethod
}

export type Logger = LogMethods & {
   group(): Logger
}

function wrapLogMethods(logMethods: LogMethods) {
   return { ...logMethods, group: () => subLogger(logMethods) }
}

function subLogger(logger: LogMethods): Logger {
   return wrapLogMethods({
      error: (...args) => logger.error(`   `, ...args),
      warn: (...args) => logger.error(`   `, ...args),
      info: (...args) => logger.error(`   `, ...args),
   })
}

export default function createLogger(): Logger {
   return wrapLogMethods({
      /* eslint-disable no-console */
      error: (...args) => console.error(chalk.red(...args)),
      warn: (...args) => console.warn(chalk.yellow(...args)),
      info: (...args) => console.log(chalk.green(...args)),
      /* eslint-enable no-console */
   })
}
