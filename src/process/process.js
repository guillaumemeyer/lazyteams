/**
 * @module Process
 * @description Process management
 */
import { inspect } from 'node:util'
import { logger } from '../logger/logger.js'
import * as ERRORS from '../errors/errors.js'

const LOG_PREFIX = 'Process:'
const startTime = Date.now()
const deepInspect = (obj) => inspect(obj, { depth: null })

/**
 * @function globalErrorHandler
 * @description Global error handler
 * @param {Error} error - The error
 * @returns {void}
 */
export function globalErrorHandler (error) {
  switch (error.constructor) {
    case ERRORS.AppError:
      logger.error(`Application error: ${deepInspect(error)}`)
      break
    case ERRORS.AuthenticationError:
      logger.error(`Authentication error: ${deepInspect(error)}`)
      break
    case ERRORS.SigninError:
      logger.error(`Signin error: ${deepInspect(error)}`)
      break
    default:
      logger.error(`Unknown error type: ${deepInspect(error)}`)
  }
  gracefulExitHandler(1, 'ERROR', 'An error occurred')
}

/**
 * @function registerSystemEventsHandlers
 * @description Configure process and register exit global handler
 * @see {@link https://nodejs.org/api/process.html#process_signal_events}
 * @see {@link http://man7.org/linux/man-pages/man7/signal.7.html}
 * @todo Check if there's a fix for bun crashing when using process.stdin.resume() in debug
 */
export function registerSystemEventsHandlers () {
  try {
    // Fix to prevent crash during debug using bun
    if (!process.env.BUN_INSPECT) {
      // Prevent the program to close instantly to get some time to gracefully exit
      process.stdin.resume()
    }

    process.on('beforeExit', function beforeExitHandler () {
      gracefulExitHandler(0, 'BEFORE_EXIT', 'Node.js has an empty event loop and has no additional work to schedule')
    })
    process.on('exit', function exitHandler () {
      gracefulExitHandler(0, 'EXIT', 'App is closing')
    })
    process.on('SIGINT', function sigintHandler () {
      gracefulExitHandler(0, 'SIGINT', 'User pressing Ctrl+C and is an interrupt')
    })
    process.on('SIGTERM', function sigtermHandler () {
      gracefulExitHandler(0, 'SIGTERM', 'Signal is sent to a process to request its termination')
    })
  } catch (err) {
    logger.error(`${LOG_PREFIX} Unexpecter error registering system events handlers in /index/registerSystemEventsHandlers. ${inspect(err)}`)
    gracefulExitHandler(1, 'Unexpected error', 'Unexpecter error registering system events handlers in /index/registerSystemEventsHandlers.')
  }
}

/**
 * @typedef {module:Node.NodeTimers.Timeout} Timeout
 */

/**
 * Timeout id used to check if a graceful exit has already been started
 * @type {Timeout} exitTimeoutId - Timeout id
 */
let exitTimeoutId = null

/**
 * @function gracefulExitHandler
 * @description Handles unexpected platform exit events (uncaughtException, unhandledRejection, SIGINT, SIGTERM, etc.)
 * @param {number} exitCode - Exit code
 * @see {@link https://nodejs.org/api/process.html#process_exit_codes}
 * @param {string} exitMessage - Exit message
 * @param {string} exitDescription - Exit description
 */
async function gracefulExitHandler (exitCode, exitMessage, exitDescription) {
  // Time to wait before exiting the program after receiving an exit signal.
  const EXIT_DELAY_MILLISECONDS = 1000
  const EXIT_SIGNAL_ALREADY_RECEIVED = exitTimeoutId !== null
  try {
    if (EXIT_SIGNAL_ALREADY_RECEIVED) {
      logger.debug(`${LOG_PREFIX} Received additional exit signal (Code: ${exitCode} / Message: ${exitMessage} / Description: ${exitDescription})`)
    } else {
      process.exitCode = exitCode
      // If successful exit, clear the timeout and exit immediately
      if (exitCode === 0) {
        logger.debug(`${LOG_PREFIX} Executed in ${Date.now() - startTime}ms`)
        logger.debug(`${LOG_PREFIX} Exiting (code ${exitCode} / Message: ${exitMessage} / Description: ${exitDescription})`)
        exitTimeoutId = 'done'
        process.exit()
      } else {
        // If unsuccessful exit, set the timeout and exit after the delay
        logger.warn(`${LOG_PREFIX} Exiting (Code: ${exitCode}) / Message: ${exitMessage} / Description: ${exitDescription})`)
        logger.warn(`${LOG_PREFIX} Will exit in ${EXIT_DELAY_MILLISECONDS}ms...`)
        exitTimeoutId = setTimeout(function finalExitHandler () {
          process.exit()
        }, EXIT_DELAY_MILLISECONDS)
      }
    }
  } catch (err) {
    logger.error(`${LOG_PREFIX} Unexpected error during teardown / exit: ${inspect(err, false, null, true)}`)
  }
}
