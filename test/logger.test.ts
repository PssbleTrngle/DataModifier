import { createLogger } from '../src/index.js'
import chalk from 'chalk'

/* eslint-disable no-console */

beforeEach(() => {
   jest.spyOn(console, 'log').mockImplementation().mockReset()
   jest.spyOn(console, 'warn').mockImplementation().mockReset()
   jest.spyOn(console, 'error').mockImplementation().mockReset()
})

describe('tests regarding the logger', () => {
   it('default logger prints console', () => {
      const logger = createLogger()

      const error = new Error('the message')
      logger.info('Info Test')
      logger.warn('Some Warning')
      logger.error('An Error Occured', error)

      expect(console.log).toHaveBeenCalledWith(chalk.green('Info Test'))
      expect(console.warn).toHaveBeenCalledWith(chalk.yellow('Some Warning'))
      expect(console.error).toHaveBeenCalledWith(chalk.red('An Error Occured'), error)
   })

   it('grouped logger prefixes spaces', () => {
      const logger = createLogger()

      logger.info('Before')

      const prefixed = logger.group()

      const error = new Error('the message')
      prefixed.info('Info Test')
      prefixed.warn('Some Warning')
      prefixed.error('An Error Occured', error)

      logger.info('After')

      expect(console.log).toHaveBeenCalledWith(chalk.green('Before'))
      expect(console.log).toHaveBeenCalledWith(chalk.green('After'))
      expect(console.log).toHaveBeenCalledWith(chalk.green('   Info Test'))
      expect(console.warn).toHaveBeenCalledWith(chalk.yellow('   Some Warning'))
      expect(console.error).toHaveBeenCalledWith(chalk.red('   An Error Occured'), error)
   })

   it('grouped logger adds prefix', () => {
      const logger = createLogger().group('prefix')

      const error = new Error('the message')
      logger.info('Info Test')
      logger.warn('Some Warning')
      logger.error('An Error Occured', error)

      expect(console.log).toHaveBeenCalledWith(chalk.green('prefix:   Info Test'))
      expect(console.warn).toHaveBeenCalledWith(chalk.yellow('prefix:   Some Warning'))
      expect(console.error).toHaveBeenCalledWith(chalk.red('prefix:   An Error Occured'), error)
   })
})

/* eslint-enable no-console */
