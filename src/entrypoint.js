#!/usr/bin/env bun

/**
 * @module Entrypoint
 */

import { EOL } from 'node:os'
import { Command } from 'commander'
import React from 'react'
import { render } from 'ink'
import { LOGO, ABOUT, PRODUCT_NAME, PRODUCT_VERSION, PRODUCT_CODE } from './constants/constants.js'
import { logger } from './logger/logger.js'
import { registerSystemEventsHandlers, globalErrorHandler } from './process/process.js'
import { App } from './components/App.jsx'
import { AppError } from './errors/errors.js'

/**
 * @function initializeProcess
 * @description Main process entrypoint
 * @returns {Promise<void>}
 * @throws {Error}
 */
async function initializeProcess () {
  try {
    registerSystemEventsHandlers()
    await initializeApp()
  } catch (error) {
    globalErrorHandler(error)
  }
}
initializeProcess()

/**
 * @function initializeApp
 * @description Initialize the CLI app
 * @returns {Promise<void>}
 * @throws {Error}
 */
async function initializeApp () {
  try {
    const app = new Command()
    app
      .name(PRODUCT_CODE)
      .description(`${LOGO}${EOL}${EOL}${ABOUT}`)
      .usage('[command] [options]')
      .helpOption(
        '-h, --help',
        'Output usage information'
      )
      .version(
        `${PRODUCT_NAME} - v${PRODUCT_VERSION}`,
        '-v, --version',
        'Output the current version'
      )
      .hook('preAction', appPreActionHandler)

    app.command('tui', { isDefault: true })
      .description('🖥️ Open lazyteams TUI (Text User Interface).')
      .option(
        '-c, --clear',
        'Clear the console before opening the TUI.',
        true
      )
      .action(async (options) => {
        try {
          if (options.clear) console.clear()
          render(<App />)
        } catch (error) {
          throw new AppError('Error rendering the TUI', { cause: error })
        }
      })

    app.parseAsync(process.argv)
  } catch (error) {
    throw new AppError('Error initializing the app', { cause: error })
  }
}

/**
 * @function appPreActionHandler
 * @description Pre-action hook for CLI commands
 * @param {Command} cliCommand - The CLI command
 * @param {Command} actionCommand - The action command
 * @returns {Promise<void>}
 * @throws {Error}
 */
async function appPreActionHandler (cliCommand, actionCommand) {
  try {
    logger.debug('preAction hook called')
    logger.debug(`About to call action handler for command: ${cliCommand.name()}`)
    logger.debug(`About to call action handler for subcommand: ${actionCommand.name()}`)
    logger.debug(`arguments: ${JSON.stringify(actionCommand.args)}`)
    logger.debug(`options: ${JSON.stringify(actionCommand.opts())}`)
  } catch (err) {
    throw new AppError('Error in preAction hook', { cause: err })
  }
}
