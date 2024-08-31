import chalk from 'chalk'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { createLogger } from '../src/index.js'

/* eslint-disable no-console */

const logMock = vi.spyOn(console, 'log')
const warnMock = vi.spyOn(console, 'warn')
const errorMock = vi.spyOn(console, 'error')

afterAll(() => {
   logMock.mockReset()
   warnMock.mockReset()
   errorMock.mockReset()
})

describe('tests regarding the logger', () => {
   it('default logger prints console', () => {
      const logger = createLogger()

      const error = new Error('the message')
      logger.info('Info Test')
      logger.warn('Some Warning')
      logger.error('An Error Occured', error)

      expect(logMock).toHaveBeenCalledWith(chalk.green('Info Test'))
      expect(warnMock).toHaveBeenCalledWith(chalk.yellow('Some Warning'))
      expect(errorMock).toHaveBeenCalledWith(chalk.red('An Error Occured'), error)
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

      expect(logMock).toHaveBeenCalledWith(chalk.green('Before'))
      expect(logMock).toHaveBeenCalledWith(chalk.green('After'))
      expect(logMock).toHaveBeenCalledWith(chalk.green('   Info Test'))
      expect(warnMock).toHaveBeenCalledWith(chalk.yellow('   Some Warning'))
      expect(errorMock).toHaveBeenCalledWith(chalk.red('   An Error Occured'), error)
   })

   it('grouped logger adds prefix', () => {
      const logger = createLogger().group('prefix')

      const error = new Error('the message')
      logger.info('Info Test')
      logger.warn('Some Warning')
      logger.error('An Error Occured', error)

      expect(logMock).toHaveBeenCalledWith(chalk.green('prefix -> Info Test'))
      expect(warnMock).toHaveBeenCalledWith(chalk.yellow('prefix -> Some Warning'))
      expect(errorMock).toHaveBeenCalledWith(chalk.red('prefix -> An Error Occured'), error)
   })
})

/* eslint-enable no-console */
