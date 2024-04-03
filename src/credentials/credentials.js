import { readFileSync, writeFileSync, accessSync, constants } from 'node:fs'
import { join } from 'node:path'
import { inspect } from 'node:util'
import { logger } from '../logger/logger.js'
import { PRODUCT_CODE } from '../constants/constants.js' // eslint-disable-line
import { env } from '../settings/settings.js'

/**
 * @class CredentialsStoreError
 * @augments {Error}
 * @description Error class for credentials store errors
 */
export class CredentialsStoreError extends Error {
  /**
   * @param {string} message - The error message
   * @param {object} [options] - The options
   * @param {Error} [options.cause] - The cause of the error
   * @throws {Error} - Thrown if an error is encountered
   */
  constructor (message, { cause } = { cause: undefined }) {
    super(message)
    this.name = this.constructor.name
    logger.error(`Error: ${message}`)
    if (cause) logger.error(`Cause: ${inspect(cause)}`)
  }
}

/**
 * @typedef {object} Credential
 * @property {string} key - The credential key (service:account:key)
 * @property {string} value - The credential value (password)
 */

/**
 * @class MemoryCredentialsStore
 * @description Memory credentials store
 */
class MemoryCredentialsStore {
  /** @param {string} service - The service */
  constructor (service) {
    /** @type {Credential[]} */
    this.credentials = []
    /** @type {string} */
    this.service = service
  }

  /**
   * @function getServiceCredentials
   * @description Get the credentials for the service
   * @returns {Promise<Credential[]>} - The credentials
   * @throws {CredentialsStoreError} - Thrown if an error is encountered
   */
  async getServiceCredentials () {
    try {
      const credentials = this.credentials.filter(credential => credential.key.startsWith(`${this.service}:`))
      return credentials
    } catch (error) {
      throw new CredentialsStoreError('Error getting credentials from memory', { cause: error })
    }
  }

  /**
   * @function getAccountCredentials
   * @description Get the credentials for an account
   * @param {object} options - The options
   * @param {string} options.account - The account
   * @returns {Promise<Credential[]>} - The credentials
   * @throws {CredentialsStoreError} - Thrown if an error is encountered
   */
  async getAccountCredentials ({ account }) {
    try {
      const credentials = this.credentials.filter(credential => credential.key.startsWith(`${this.service}:${account}`))
      return credentials
    } catch (error) {
      throw new CredentialsStoreError('Error getting credential from memory', { cause: error })
    }
  }

  /**
   * @function getCredential
   * @description Get a credential
   * @param {object} options - The options
   * @param {string} options.account - The account
   * @param {string} options.key - The key
   * @returns {Promise<Credential>} - The credential
   * @throws {CredentialsStoreError} - Thrown if an error is encountered
   */
  async getCredential ({ account, key }) {
    try {
      const credential = this.credentials.find(credential => credential.key === `${this.service}:${account}:${key}`)
      return credential
    } catch (error) {
      throw new CredentialsStoreError('Error getting credential from memory', { cause: error })
    }
  }

  /**
   * @function setCredential
   * @description Set a credential
   * @param {object} options - The options
   * @param {string} options.account - The account
   * @param {string} options.key - The key
   * @param {string} options.value - The value
   * @returns {Promise<boolean>} - The result
   * @throws {CredentialsStoreError} - Thrown if an error is encountered
   */
  async setCredential ({ account, key, value }) {
    try {
      // Check if the credential already exists
      const existingCredential = this.credentials.find(credential => credential.key === `${this.service}:${account}:${key}`)
      if (existingCredential) {
        existingCredential.value = value
      } else {
        this.credentials.push({
          key: `${this.service}:${account}:${key}`,
          value
        })
      }
      return true
    } catch (error) {
      throw new CredentialsStoreError('Error setting credential in memory', { cause: error })
    }
  }

  /**
   * @function deleteCredential
   * @description Delete a credential
   * @param {object} options - The options
   * @param {string} options.account - The account
   * @param {string} options.key - The key
   * @returns {Promise<boolean>} - The result
   * @throws {CredentialsStoreError} - Thrown if an error is encountered
   */
  async deleteCredential ({ account, key }) {
    try {
      this.credentials = this.credentials.filter(credential => credential.key !== `${this.service}:${account}:${key}`)
      return true
    } catch (error) {
      throw new CredentialsStoreError('Error deleting credential in memory', { cause: error })
    }
  }
}

/**
 * @class FileCredentialsStore
 * @description File credentials store
 */
class FileCredentialsStore {
  /** @param {string} service - The service */
  constructor (service) {
    /** @type {string} */
    this.credentialsFilePath = join(String(env.CREDENTIALS_DIR), 'credentials.json')
    /** @type {string} */
    this.service = service
  }

  /**
   * @function getServiceCredentials
   * @description Get the credentials for the service
   * @returns {Promise<Credential[]>} - The credentials
   * @throws {CredentialsStoreError} - Thrown if an error is encountered
   */
  async getServiceCredentials () {
    try {
      accessSync(this.credentialsFilePath, constants.R_OK)
      /** @type {Credential[]} */
      const credentials = JSON.parse(readFileSync(this.credentialsFilePath, 'utf-8')) // eslint-disable-line
      const serviceCredentials = credentials.filter(credential => credential.key.startsWith(`${this.service}:`))
      return serviceCredentials
    } catch (error) {
      throw new CredentialsStoreError('Error getting credentials from file', { cause: error })
    }
  }

  /**
   * @function getAccountCredentials
   * @description Get the credentials for an account
   * @param {object} options - The options
   * @param {string} options.account - The account
   * @returns {Promise<Credential[]>} - The credential
   * @throws {CredentialsStoreError} - Thrown if an error is encountered
   */
  async getAccountCredentials ({ account }) {
    try {
      accessSync(this.credentialsFilePath, constants.R_OK)
      /** @type {Credential[]} */
      const credentials = JSON.parse(readFileSync(this.credentialsFilePath, 'utf-8')) // eslint-disable-line
      const accountCredentials = credentials.filter(credential => credential.key.startsWith(`${this.service}:${account}`))
      return accountCredentials
    } catch (error) {
      throw new CredentialsStoreError('Error getting credential from file', { cause: error })
    }
  }

  /**
   * @function getCredential
   * @description Get a credential
   * @param {object} options - The options
   * @param {string} options.account - The account
   * @param {string} options.key - The key
   * @returns {Promise<Credential>} - The credential
   * @throws {CredentialsStoreError} - Thrown if an error is encountered
   */
  async getCredential ({ account, key }) {
    try {
      accessSync(this.credentialsFilePath, constants.R_OK)
      /** @type {Credential[]} */
      const credentials = JSON.parse(readFileSync(this.credentialsFilePath, 'utf-8')) // eslint-disable-line
      const credential = credentials.find(credential => credential.key === `${this.service}:${account}:${key}`)
      return credential
    } catch (error) {
      throw new CredentialsStoreError('Error getting credential from file', { cause: error })
    }
  }

  /**
   * @function setCredential
   * @description Set a credential
   * @param {object} options - The options
   * @param {string} options.account - The account
   * @param {string} options.key - The key
   * @param {string} options.value - The password
   * @returns {Promise<boolean>} - The result
   * @throws {CredentialsStoreError} - Thrown if an error is encountered
   */
  async setCredential ({ account, key, value }) {
    try {
      /** @type {Credential[]} */
      let credentials = []
      accessSync(this.credentialsFilePath, constants.R_OK)
      credentials = JSON.parse(readFileSync(this.credentialsFilePath, 'utf-8')) // eslint-disable-line
      // Check if the credential already exists
      /** @type {Credential} */
      const existingCredential = credentials.find(
        /**
         * @param {Credential} credential - The credential
         * @returns {boolean} Result
         */
        credential => credential.key === `${this.service}:${account}:${key}`
      )
      if (existingCredential) {
        existingCredential.value = value
      } else {
        credentials.push({
          key: `${this.service}:${account}:${key}`,
          value
        })
      }
      writeFileSync(this.credentialsFilePath, JSON.stringify(credentials, null, 2)) // eslint-disable-line
      return true
    } catch (error) {
      logger.error(`Error setting credential in file: ${inspect(error)}`)
      return false
    }
  }

  /**
   * @function deleteCredential
   * @description Delete a credential
   * @param {object} options - The options
   * @param {string} options.account - The account
   * @param {string} options.key - The key
   * @returns {Promise<boolean>} - The result
   * @throws {CredentialsStoreError} - Thrown if an error is encountered
   */
  async deleteCredential ({ account, key }) {
    try {
      accessSync(this.credentialsFilePath, constants.R_OK)
      /** @type {Credential[]} */
      let credentials = JSON.parse(readFileSync(this.credentialsFilePath, 'utf-8')) // eslint-disable-line
      credentials = credentials.filter(credential => credential.key !== `${this.service}:${account}:${key}`)
      writeFileSync(this.credentialsFilePath, JSON.stringify(credentials, null, 2)) // eslint-disable-line
      return true
    } catch (error) {
      throw new CredentialsStoreError('Error deleting credential in file', { cause: error })
    }
  }
}

/** @typedef {'file'|'memory'|string} CredentialsStoreStorage */

/**
 * @function initializeCredentialsStore
 * @description Initialize the credentials store
 * @returns {MemoryCredentialsStore|FileCredentialsStore} - The credentials store
 * @throws {Error} - Thrown if an error is encountered
 */
function initializeCredentialsStore () {
  /** @type {CredentialsStoreStorage} */
  const credentialsStoreProvider = String(env.CREDENTIALS_STORE_PROVIDER) || 'memory'
  const SERVICE = PRODUCT_CODE
  switch (credentialsStoreProvider) {
    case 'fs':
      return new FileCredentialsStore(SERVICE)
    case 'memory':
      return new MemoryCredentialsStore(SERVICE)
    default:
      throw new Error(`Invalid credentials store provider: ${credentialsStoreProvider}`)
  }
}
export const credentialsStore = initializeCredentialsStore()
