import chalk from 'chalk'

type Logable = string | number | boolean | null | undefined
type LogMethod = (message: Logable) => void

type LogMethods = {
   error: LogMethod
   warn: LogMethod
   info: LogMethod
}

export type Logger = LogMethods & {
   group(): Logger
}

export function wrapLogMethods(logMethods: LogMethods) {
   return { ...logMethods, group: () => subLogger(logMethods) }
}

function subLogger(logger: LogMethods): Logger {
   return wrapLogMethods({
      error: message => logger.error(`   ${message}`),
      warn: message => logger.warn(`   ${message}`),
      info: message => logger.info(`   ${message}`),
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
