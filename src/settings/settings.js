'use strict'
/**
 * @module Settings
 * @description Helper functions to handle environments variables
 */

import { EOL } from 'node:os'
import process from 'node:process'
import { inspect } from 'node:util'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import xdg from '@folder/xdg'
import { PRODUCT_CODE } from '../constants/constants.js' // eslint-disable-line

const LOG_PREFIX = 'Settings'

/**
 * @typedef {object} XdgDirectories
 * @property {string} cwd - The current working directory
 * @property {string} home - The home directory
 * @property {string} temp - The temporary directory
 * @property {object} cache - The cache directories
 * @property {string} cache.home - The cache home directory
 * @property {string} cache.logs - The cache logs directory
 * @property {object} config - The config directories
 * @property {string} config.home - The config home directory
 * @property {string[]} config.dirs - The config directories
 * @property {object} data - The data directories
 * @property {string} data.home - The data home directory
 * @property {string[]} data.dirs - The data directories
 * @property {object} runtime - The runtime directories
 */

/** @type {XdgDirectories} */
const xdgDirectories = xdg({
  expanded: true,
  subdir: PRODUCT_CODE
})

/**
 * @typedef {object} SettingsSpecificationCategory
 * @property {string} category - Category
 * @property {string} description - Category description
 * @property {Array<SettingsSpecificationDomain>} domains - Domains
 */

/**
 * @typedef {object} SettingsSpecificationDomain
 * @property {string} domain - Domain
 * @property {string} description - Domain description
 * @property {Array<SettingsSpecificationKey>} keys - Keys
 */

/**
 * @typedef {object} SettingsSpecificationKey
 * @property {string} key - Key name
 * @property {boolean} mandatory - Is the key mandatory?
 * @property {string|number|boolean} default_value - Default value of the key
 * @property {string} [default_description] - Additional comment that describes the default value
 * @property {'string'|'boolean'|'integer'} type - Type the key value is transformed to at runtime
 * @property {string} description - Description of the key
 * @property {boolean} sensitive - Is the key sensitive? (i.e. should be masked + not be logged)
 */

/**
 * @type {SettingsSpecificationCategory[]}
 */
export const settingsSpecifications = [
  {
    category: 'User Settings',
    description: 'Settings that are specific to the user',
    domains: [
      {
        domain: 'Logs',
        description: 'Logging settings',
        keys: [
          {
            key: 'LOG_LEVEL',
            description: 'Logging level. Uses levels `error` / `warn` / `info` / `debug` (highest to lowest).',
            mandatory: false,
            default_value: 'info',
            type: 'string',
            sensitive: false
          },
          {
            key: 'LOG_DIR',
            description: 'Defines logs directory location.',
            mandatory: false,
            default_value: xdgDirectories.cache.logs,
            type: 'string',
            sensitive: false
          }
        ]
      },
      {
        domain: 'Cache',
        description: 'Cache settings',
        keys: [
          {
            key: 'CACHE_DIR',
            description: 'Defines cache directory location.',
            mandatory: false,
            default_value: xdgDirectories.cache.home,
            type: 'string',
            sensitive: false
          }
        ]
      },
      {
        domain: 'Settings',
        description: 'Application settings',
        keys: [
          {
            key: 'SETTINGS_LOG_ON_STARTUP',
            description: 'Log settings on startup.',
            mandatory: false,
            default_value: false,
            type: 'boolean',
            sensitive: false
          },
          {
            key: 'SETTINGS_STRICT_MODE',
            description: 'Enable strict mode.',
            mandatory: false,
            default_value: true,
            type: 'boolean',
            sensitive: false
          },
          {
            key: 'SETTINGS_DIR',
            description: 'Defines settings directory location.',
            mandatory: false,
            default_value: xdgDirectories.config.home,
            type: 'string',
            sensitive: false
          }
        ]
      },
      {
        domain: 'Credentials',
        description: 'Credentials settings',
        keys: [
          {
            key: 'CREDENTIALS_STORE_PROVIDER',
            description: 'Credentials store provider (fs|memory).',
            mandatory: false,
            default_value: 'memory',
            type: 'string',
            sensitive: false
          },
          {
            key: 'CREDENTIALS_DIR',
            description: 'Defines credentials directory location.',
            mandatory: false,
            default_value: join(xdgDirectories.config.home, 'credentials'),
            type: 'string',
            sensitive: false
          },
          {
            key: 'DEFAULT_ACCOUNT',
            description: 'Default account to use for authentication.',
            mandatory: false,
            default_value: null,
            type: 'integer',
            sensitive: false
          }
        ]
      }
    ]
  }
]

/**
 * @typedef {object} SettingsInitializationOptions
 * @property {boolean} logOnStartup - Log options values
 * @property {boolean} strictMode - Exit on missing mandatory setting
 */

/**
 * @type {SettingsInitializationOptions}
 * @description Initialization options
 */
const settingsOptions = {
  logOnStartup: process.env.SETTINGS_LOG_ON_STARTUP ? JSON.parse(process.env.SETTINGS_LOG_ON_STARTUP) : false,
  strictMode: process.env.SETTINGS_STRICT_MODE ? JSON.parse(process.env.SETTINGS_STRICT_MODE) : true
}

/**
 * @typedef {{[key: string]: string|number|boolean}} Variables - Environment variables
 */

/** @type {Variables} */
const variables = {}

/**
 * @function Initialize environment variables and associated behaviors
 * @returns {void}
 * @throws {Error} Throws an error if the initialization failed
 */
function initVariables () {
  try {
    // Iterate over all keys (by categories)
    settingsSpecifications.forEach(category => {
      // Iterate over all keys of the current category (by domain)
      category.domains.forEach(domain => {
        // Iterate over all keys of the current domain (by key)
        domain.keys.forEach(key => {
          const value = formatEnvironmentVariable({
            input: process.env[key.key] || '',
            type: key.type,
            fallback: key.default_value
          })
          if (settingsOptions.logOnStartup) {
            // Log options values
            // Redact sensitive values. Hide by default if not defined
            const logValue = key.sensitive === false ? value : 'REDACTED:SENSITIVE'
            console.debug(`${LOG_PREFIX} - ${key.key}=${logValue}`)
          }
          variables[key.key] = value
          if (
            key.mandatory &&
            (
              value === undefined ||
              value === null ||
              value === ''
            )
          ) {
            if (settingsOptions.strictMode) {
              console.error(`${LOG_PREFIX} - 🔥 ${key.key} mandatory option is not defined. Please refer to the option description: "${key.description}"`)
              // Using `process.exit` is not recommended, using `exitCode` instead.
              // See:
              // - https://nodejs.org/api/process.html#process_process_exit_code
              // - https://nodejs.org/api/process.html#process_exit_codes
              console.error(`${LOG_PREFIX} 🔥 Exiting process with code 9...`)
              process.exitCode = 9
              process.exit()
            }
          } else {
            variables[key.key] = value
          }
        })
      })
    })
  } catch (err) {
    console.error(`${LOG_PREFIX} Unexpected error: ${inspect(err)}`)
    throw err
  }
}
initVariables()

/** @type {Variables} */
export const env = variables

mkdirSync(String(variables.LOG_DIR), { recursive: true }) // eslint-disable-line
mkdirSync(String(variables.CACHE_DIR), { recursive: true }) // eslint-disable-line
mkdirSync(String(variables.SETTINGS_DIR), { recursive: true }) // eslint-disable-line
mkdirSync(String(variables.CREDENTIALS_DIR), { recursive: true }) // eslint-disable-line

/**
 * @function Formats a string-based environment variables to the expected type based on its value
 * @param {object} environmentVariableOptions - Environment variable options
 * @param {string} environmentVariableOptions.input - Environment variable value
 * @param {('string'|'boolean'|'integer')} environmentVariableOptions.type - Environment variable type
 * @param {string|number|boolean} environmentVariableOptions.fallback - Environment variable fallback value
 * @returns {any} The parsed environment variable value in the right type
 */
function formatEnvironmentVariable ({
  input,
  type,
  fallback
}) {
  switch (input) {
    case undefined:
      return fallback
    case '':
      return fallback
    case 'null':
      return ''
    default:
      switch (type) {
        case 'string':
          return input
        case 'boolean':
          return input === 'true'
        case 'integer':
          return parseInt(input)
        default:
          return input
      }
  }
}

/**
 * Generate .env file sample
 * @returns {string} .env file sample
 */
export function generateDotEnvSample () {
  try {
    const keyPlaceholder = '{REPLACE_ME}'
    // Create .env file sample
    let content = ''
    // Iterate over categories
    settingsSpecifications.forEach((category) => {
      // Create category header
      content += `# --- ${EOL}`
      content += `# ${category.category} ${EOL}`
      content += `# ${category.description} ${EOL}`
      content += `# --- ${EOL}`

      // Iterate over domains
      category.domains.forEach((domain) => {
        // Create domain header
        content += EOL
        content += `# ${domain.domain} ${EOL}`
        content += `# ${domain.description} ${EOL}${EOL}`

        // Create key entry
        domain.keys.forEach((key) => {
          let keyValue = key.default_value
          if (key.mandatory === true) {
            keyValue = keyPlaceholder
          }
          content += `# ${key.description} (${key.type}) ${EOL}`
          if (key.sensitive !== false) {
            content += `# N.B: This key is flagged as sensitive. ${EOL}`
          }
          content += `${key.key}=${keyValue} ${EOL}`
        })
      })
    })
    return content
  } catch (err) {
    console.error('Unexpected error in generateDotEnvSample', err)
    return ''
  }
}

/**
 * Generate configuration reference documentation
 * @returns {string} Configuration reference documentation
 */
export function generateConfigurationReferenceDocumentation () {
  try {
    let content = ''
    content += `# Configuration Reference ${EOL}`
    content += `📆 *Updated: ${new Date().toUTCString()}* ${EOL}${EOL}`
    content += `This document lists all the configuration options supported by the platform. ${EOL}${EOL}`
    content += `Options are grouped by category, then by domain, and each option is specified with: ${EOL}`
    content += `- **Environment Variable**: The corresponging environment variable to be set. ${EOL}`
    content += `- **Description**: Description of the option mentionning its type and default value ${EOL}`
    content += `- **Type**: The type the environment variable is going to be converted to. ${EOL}`
    content += `- **Default**: Default value if omitted. ${EOL}`
    content += `- **Sensitive**: If the value is sensitive (Sensitive values won't be logged). ${EOL}`
    content += `- **Mandatory**: Defines if the option is required or optional. ${EOL}`

    // Iterate over categories
    settingsSpecifications.forEach((category) => {
      // Create category header
      content += EOL
      content += `## ${category.category} ${EOL}`
      content += `*${category.description}* ${EOL}`

      // Iterate over domains
      category.domains.forEach((domain) => {
        // Create domain header
        content += EOL
        content += `### ${domain.domain} ${EOL}`
        content += `*${domain.description}* ${EOL}${EOL}`
        content += `--- ${EOL}`

        content += `| Environment Variable | Description | Type | Default | Sensitive | Mandatory | ${EOL}`
        content += `|:---------------------|:------------|:-----|:--------|:----------|:----------| ${EOL}`

        // Create key entry
        domain.keys.forEach((key) => {
          const mandatoryValue = key.mandatory ? 'Required ✅' : 'Optional'
          /**
           * @type {any}
           */
          let defaultValue = ''
          if (key.default_description && key.default_description !== '') {
            defaultValue = key.default_description
          } else {
            defaultValue = key.default_value
          }
          const sensitiveValue = key.sensitive !== false ? '🔥 TRUE' : 'false'
          content += `| \`${key.key}\` | ${key.description} | ${key.type} | ${defaultValue} | ${sensitiveValue} | ${mandatoryValue} | ${EOL}`
        })
        content += `${EOL}${EOL}`
      })
    })
    return content
  } catch (err) {
    console.error('Unexpected error in configurationReference', err)
    return ''
  }
}
