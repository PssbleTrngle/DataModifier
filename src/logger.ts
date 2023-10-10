import chalk from 'chalk'

type Logable = string | number | boolean | null | undefined
type LogMethod = (message: Logable, ...args: unknown[]) => void

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

export function createSilentLogger(): Logger {
   return wrapLogMethods({
      error: () => {},
      warn: () => {},
      info: () => {},
   })
}

export default function createLogger(): Logger {
   return wrapLogMethods({
      /* eslint-disable no-console */
      error: (msg, ...args) => console.error(chalk.red(msg), ...args),
      warn: (msg, ...args) => console.warn(chalk.yellow(msg), ...args),
      info: (msg, ...args) => console.log(chalk.green(msg), ...args),
      /* eslint-enable no-console */
   })
}
