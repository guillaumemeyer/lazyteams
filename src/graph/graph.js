import { inspect } from 'node:util'
import { Client as GraphClient } from '@microsoft/microsoft-graph-client'
import { logger } from '../logger/logger.js'
import { jwtDecode } from 'jwt-decode'
import { credentialsStore } from '../credentials/credentials.js'
import { env } from '../settings/settings.js'
import { AuthenticationError, SigninError } from '../errors/errors.js'

const MICROSOFT_IDENTITY_PLATFORM_URL = 'https://login.microsoftonline.com'
const MICROSOFT_AZURE_AD_APP_CLIENT_ID = '74201357-4b0e-4667-b9a6-c1cf7de422a3'
const OPENID_SCOPE = [
  'openid',
  'profile',
  'offline_access',
  'email',
  'user.read'
]
const MICROSOFT_GRAPH_SCOPE = [
  'Team.ReadBasic.All',
  'Chat.ReadWrite',
  'User.ReadBasic.All'
]

const LOG_PREFIX = 'Authentication:'
let activeAccount = env.DEFAULT_ACCOUNT ? String(env.DEFAULT_ACCOUNT) : null

/**
 * @function getActiveAccount
 * @description Get the active account
 * @returns {string} - The active account
 * @throws {Error} - Thrown if an error is encountered
 */
export function getActiveAccount () {
  try {
    return activeAccount
  } catch (error) {
    throw new AuthenticationError('Error getting active account', { cause: error })
  }
}
/**
 * @function setActiveAccount
 * @description Set the active account
 * @param {string} account - The account
 * @returns {boolean} - The result
 * @throws {Error} - Thrown if an error is encountered
 */
export function setActiveAccount (account) {
  try {
    activeAccount = account
    return true
  } catch (error) {
    throw new AuthenticationError('Error setting active account', { cause: error })
  }
}

/**
 * @function getSigninStatus
 * @description Check if the user is signed in
 * @returns {Promise<boolean>} - The result
 * @throws {SigninError} - Thrown if an error is encountered
 */
export async function getSigninStatus () {
  try {
    if (!activeAccount) return false
    const accountCredentials = await credentialsStore.getAccountCredentials({ account: activeAccount })

    const ACCOUNT_HAS_CREDENTIALS = accountCredentials && accountCredentials.length > 0
    if (!ACCOUNT_HAS_CREDENTIALS) return false

    const accessToken = accountCredentials.find(credential => credential.key.includes('AccessToken'))
    const refreshToken = accountCredentials.find(credential => credential.key.includes('RefreshToken'))
    const ACCOUNT_HAS_TOKENS = accessToken && refreshToken
    if (!ACCOUNT_HAS_TOKENS) return false

    const grantedPermissions = await getAccessTokenScope(accessToken.value)
    const HAS_REQUIRED_SCOPE = MICROSOFT_GRAPH_SCOPE.every(requiredPermission => grantedPermissions.includes(requiredPermission))
    if (!HAS_REQUIRED_SCOPE) throw new Error('Access token is missing required scope')

    const NOW = Math.floor(Date.now() / 1000)
    const accessTokenExpiresAt = jwtDecode(accessToken.value).exp
    const ACCESS_TOKEN_IS_EXPIRED = accessTokenExpiresAt < NOW
    if (ACCESS_TOKEN_IS_EXPIRED) throw new Error('Access token is expired')

    return true
  } catch (error) {
    throw new SigninError('Error checking if signed in', { cause: error })
  }
}

/**
 * @typedef {object} MicrosoftJwtClaimsExtensions
 * @property {string} [cloud_instance_name] - The cloud instance name
 * @property {string} [cloud_instance_host_name] - The cloud instance host name
 * @property {string} [cloud_graph_host_name] - The cloud graph host name
 * @property {string} [msgraph_host] - The Microsoft Graph host
 * @property {string} [auth_time] - The authentication time
 * @property {string} [acr] - The authentication context class reference
 * @property {string} [nonce] - The nonce
 * @property {string} [preferred_username] - The preferred username
 * @property {string} [name] - The name
 * @property {string} [tid] - The tenant ID
 * @property {string} [ver] - The version
 * @property {string} [scp] - The scope
 * @property {string} [at_hash] - The access token hash
 * @property {string} [c_hash] - The code hash
 * @property {string} [email] - The email
 */

/**
 * @typedef {import('jwt-decode').JwtPayload & MicrosoftJwtClaimsExtensions} MicrosoftJwtToken
 */

/**
 * @function getAccessTokenScope
 * @description Extract the scope from an access token
 * @param {string} accessToken - Access token
 * @returns {Promise<string[]>} - The scope as an array of strings
 * @throws {Error} - Thrown if an error is encountered
 */
async function getAccessTokenScope (accessToken) {
  try {
    /** @type {MicrosoftJwtToken} */
    const decodedToken = jwtDecode(accessToken)
    if (decodedToken.scp) {
      const scopeAsArray = decodedToken.scp.split(' ')
      return scopeAsArray
    } else {
      throw new Error('No scope found in the access token.')
    }
  } catch (err) {
    logger.error(`${LOG_PREFIX} Unexpected error in getAccessTokenScope: ${inspect(err)}`)
    throw err
  }
}

/**
 * @typedef {object} AccountCredentials
 * @property {string} account - The account
 * @property {boolean} default - Whether the account is the default account
 * @property {string} accessToken - The access token
 * @property {string} refreshToken - The refresh token
 */

/**
 * @typedef {Map<string>} UserCredentials
 */

/**
 * @function getUserCredentials
 * @description Get credentials for all the accounts
 * @returns {Promise<UserCredentials>} - The credentials
 */
export async function getUserCredentials () {
  try {
    /** @type {UserCredentials} */
    const userCredentials = new Map()
    const credentials = await credentialsStore.getServiceCredentials()
    credentials.forEach(credential => {
      // Extract the account name from the key
      const account = credential.key.split(':')[1]
      // If there's no existing user credentials for this account, create an empty array
      if (!userCredentials.has(account)) userCredentials.set(account, {})
      // Get the value
      if (credential.key.includes('AccessToken')) {
        userCredentials.get(account).accessToken = credential.value
      } else if (credential.key.includes('RefreshToken')) {
        userCredentials.get(account).refreshToken = credential.value
      }
    })
    return userCredentials
  } catch (error) {
    throw new SigninError('Error getting credentials', { cause: error })
  }
}

/**
 * @function getCredentials
 * @description Get credentials for the active account
 * @returns {Promise<AccountCredentials>} - The credentials
 * @throws {SigninError} - Thrown if an error is encountered
 */
export async function getCredentials () {
  try {
    /** @type {import('../credentials/credentials.js').Credential[]} */
    const credentials = await credentialsStore.getAccountCredentials({ account: activeAccount })
    const accountCredentials = {
      account: activeAccount,
      default: activeAccount === env.DEFAULT_ACCOUNT,
      accessToken: credentials.find(credential => credential.key.includes('AccessToken')).value,
      refreshToken: credentials.find(credential => credential.key.includes('RefreshToken')).value
    }
    return accountCredentials
  } catch (error) {
    throw new SigninError('Error getting credentials', { cause: error })
  }
}

/**
 * @typedef {object} DeviceCodePayload
 * @property {string} device_code - A long string used to verify the session between the client and the authorization server. The client uses this parameter to request the access token from the authorization server.
 * @property {string} user_code - A short string shown to the user used to identify the session on a secondary device.
 * @property {string} verification_uri - The URI the user should go to with the user_code in order to sign in.
 * @property {number} expires_in - The number of seconds before the device_code and user_code expire.
 * @property {number} interval - The number of seconds the client should wait between polling requests.
 * @property {string} message - A human-readable string with instructions for the user. This can be localized by including a query parameter in the request of the form ?mkt=xx-XX, filling in the appropriate language culture code.
 * @see https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-device-code#device-authorization-response
 */

/**
 * @function signin
 * @description Get a device code from Microsoft Identity
 * @returns {Promise<DeviceCodePayload>} - The device code payload
 * @throws {Error} - Thrown if an error is encountered
 */
export async function signin () {
  try {
    const fetchUrl = `${MICROSOFT_IDENTITY_PLATFORM_URL}/organizations/oauth2/v2.0/devicecode`
    const params = new URLSearchParams({
      client_id: MICROSOFT_AZURE_AD_APP_CLIENT_ID,
      scope: OPENID_SCOPE.concat(MICROSOFT_GRAPH_SCOPE).join(' ')
    })
    const fetchOptions = {
      method: 'POST',
      keepalive: true,
      body: params.toString(),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    const deviceCodeResponse = await fetch(fetchUrl, fetchOptions)
    /** @type {DeviceCodePayload} */
    const deviceCodePayload = await deviceCodeResponse.json()
    switch (deviceCodeResponse.status) {
      case 200:
        return deviceCodePayload
      default:
        throw new AuthenticationError(`Error ${deviceCodeResponse.status} while trying to acquire a device code: ${inspect(deviceCodePayload)}`)
    }
  } catch (err) {
    throw new AuthenticationError('Error while trying to acquire a device code', { cause: err })
  }
}

/**
 * @typedef {object} AuthenticationPayload
 * @property {string} token_type - Always Bearer.
 * @property {string} scope - Space separated strings. If an access token was returned, this lists the scopes in which the access token is valid for.
 * @property {number} expires_in - Number of seconds the included access token is valid for.
 * @property {string} access_token - Opaque string. Issued for the scopes that were requested.
 * @property {string} id_token - JWT. Issued if the original scope parameter included the openid scope.
 * @property {string} refresh_token - Opaque string. Issued if the original scope parameter included offline_access.
 */

/**
 * @function listenForDeviceCodeAuthentication
 * @description Listen for device code authentication
 * @param {DeviceCodePayload} deviceCodePayload - The device code payload
 * @returns {Promise<null|AuthenticationPayload>} - The result
 * @throws {Error} - Thrown if an error is encountered
 */
export async function listenForDeviceCodeAuthentication (deviceCodePayload) {
  try {
    const fetchUrl = `${MICROSOFT_IDENTITY_PLATFORM_URL}/organizations/oauth2/v2.0/token`
    const params = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      client_id: MICROSOFT_AZURE_AD_APP_CLIENT_ID,
      device_code: deviceCodePayload.device_code
    })
    const fetchOptions = {
      method: 'POST',
      keepalive: true,
      body: params.toString(),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    // Call Microsoft Identity /token endpoint
    const fetchResponse = await fetch(fetchUrl, fetchOptions)
    /** @type {AuthenticationPayload|object} */
    const fetchData = await fetchResponse.json()
    const error = fetchData.error
    switch (fetchResponse.status) {
      case 200:
        logger.debug(`${LOG_PREFIX} Authentication successful.`)
        break
      case 400:
        switch (error) {
          // TODO: Implement expected errors handlers
          // https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-device-code#expected-errors
          case 'authorization_pending':
            logger.debug(`${LOG_PREFIX} Authorization pending...`)
            return null
          case 'authorization_declined':
            throw new Error('Authorization declined by the user.')
          case 'bad_verification_code':
            throw new Error('The user code is invalid.')
          case 'expired_token':
            throw new Error('The device code has expired.')
          default:
            throw new Error(`Error ${fetchResponse.status} while trying to acquire an access token: ${inspect(fetchData)}`)
        }
      case 401:
        switch (error) {
          case 'invalid_client':
            return null
          default:
            throw new Error(`Error ${fetchResponse.status} while trying to acquire an access token: ${inspect(fetchData)}`)
        }
      default:
        throw new Error(`Error ${fetchResponse.status} while trying to acquire an access token: ${inspect(fetchData)}`)
    }

    const userProfileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${fetchData.access_token}`
      }
    })
    const userProfile = await userProfileResponse.json()
    setActiveAccount(userProfile.userPrincipalName)
    credentialsStore.setCredential({ account: activeAccount, key: 'AccessToken', value: fetchData.access_token })
    credentialsStore.setCredential({ account: activeAccount, key: 'RefreshToken', value: fetchData.refresh_token })
    return fetchData
  } catch (err) {
    logger.error(`${LOG_PREFIX} Unexpected error while trying to acquire an access token: ${inspect(err)}`)
    throw err
  }
}

/**
 * @function microsoftGraphAuthProvider
 * @description Microsoft Graph auth provider
 * @param {Function} done - The callback function
 * @returns {Promise<void>}
 */
async function microsoftGraphAuthProvider (done) {
  try {
    const accountCredentials = await credentialsStore.getAccountCredentials({ account: activeAccount })
    const accessToken = accountCredentials.find(credential => credential.key.includes('AccessToken'))
    done(null, accessToken.value)
  } catch (error) {
    done(error)
  }
}

/**
 * @function getMyProfile
 * @description Get the user's profile
 * @returns {Promise<import('@microsoft/microsoft-graph-types').User>} - The user's profile
 * @throws {Error} - Thrown if an error is encountered
 */
export async function getMyProfile () {
  try {
    // return {
    //   displayName: 'John Doe'
    // }
    const graphClient = GraphClient.init({ authProvider: microsoftGraphAuthProvider })
    /** @type {import('@microsoft/microsoft-graph-types').User} */
    const userProfile = await graphClient.api('/me').get()
    logger.debug(`User profile: ${userProfile.userPrincipalName}`)
    return userProfile
  } catch (error) {
    logger.error(`Unexpected error during logSignedin: ${inspect(error)}`)
    throw new Error('Error getting user profile')
  }
}
