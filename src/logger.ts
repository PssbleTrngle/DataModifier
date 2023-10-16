import chalk from 'chalk'

type Logable = string | number | boolean | null | undefined
type LogMethod = (message: Logable, ...args: unknown[]) => void

type LogMethods = {
   error: LogMethod
   warn: LogMethod
   info: LogMethod
}

export type Logger = LogMethods & {
   group(prefix?: string): Logger
}

export function wrapLogMethods(logMethods: LogMethods): Logger {
   return { ...logMethods, group: prefix => subLogger(logMethods, prefix) }
}

function grouped(prefix: string | undefined, message: Logable) {
   if (prefix) return `${prefix} -> ${message}`
   return `   ${message}`
}

function subLogger(logger: LogMethods, prefix?: string): Logger {
   return wrapLogMethods({
      error: (message, ...args) => logger.error(grouped(prefix, message), ...args),
      warn: (message, ...args) => logger.warn(grouped(prefix, message), ...args),
      info: (message, ...args) => logger.info(grouped(prefix, message), ...args),
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
