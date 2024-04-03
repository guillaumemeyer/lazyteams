/**
 * @module Logging
 * @file Logging module
 */

import os from 'node:os'
import { inspect } from 'node:util'
import { env } from '../settings/settings.js'
import { createLogger, format } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

/**
 * @typedef {module:winston.Logger} WinstonLogger
 */

/**
 * @typedef {module:Node.Console} Console
 */

/**
 * @function initializeLogger
 * @description Initialize the logging module
 * @returns {WinstonLogger|Console} - The logger instance
 */
function initializeLogger () {
  const LOGGER_PREFIX = 'Logging:'
  /** @type {WinstonLogger|Console} */
  let internalLogger = console
  try {
    const logLevel = String(env.LOG_LEVEL)
    const logsDirectory = String(env.LOG_DIR)
    const activeTransports = []
    const { printf } = format

    // File transport
    // See https://github.com/winstonjs/winston-daily-rotate-file
    if (logsDirectory) {
      // try to create the file transport, skip if it fails to access the local folder (doesn't exist or no access)
      try {
        // Formatting function for the file transport
        const fileFormat = printf(({ level, message, timestamp }) => {
          return `[${timestamp}] [${level}] ${message}`
        })
        /** @type {DailyRotateFile} */
        const fileTransport = new DailyRotateFile({
          level: logLevel,
          format: format.combine(
            format.timestamp(),
            fileFormat
          ),
          filename: `%DATE%-${os.hostname()}.log`,
          datePattern: 'YYYY-MM-DD',
          dirname: logsDirectory,
          zippedArchive: false,
          maxSize: '50m',
          maxFiles: '28d',
          auditFile: `${logsDirectory}/audit.json`,
          utc: true
        })
        fileTransport.on('rotate', (oldFilename, newFilename) => {
          internalLogger.debug(`${LOGGER_PREFIX} Log file rotated from ${oldFilename} to ${newFilename}`)
        })
        activeTransports.push(fileTransport)
      } catch (err) {
        console.error(`${LOGGER_PREFIX} Unexpected error initializing log file transport. ${inspect(err, false, null, true)}`)
      }
    }
    // Finally create logger and add transports
    internalLogger = createLogger({ transports: activeTransports })
    internalLogger.debug.bind(internalLogger)
    internalLogger.warn.bind(internalLogger)
    internalLogger.info.bind(internalLogger)
    internalLogger.error.bind(internalLogger)
    if (logsDirectory) {
      internalLogger.debug(`${LOGGER_PREFIX} Persistence enabled at ${logsDirectory} with log level: ${logLevel}`)
    }
    return internalLogger
  } catch (err) {
    console.error(inspect(err, false, null, true))
    throw err
  }
}

/** @type {WinstonLogger|Console} */
export const logger = initializeLogger()
