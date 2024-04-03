import { inspect } from 'node:util'
import React, { useState, useEffect } from 'react'
import { Text, Box, Newline } from 'ink'
import clipboard from 'clipboardy'
import InkAsciifyImage from 'ink-asciify-image'
import { logger } from '../logger/logger.js'
import { signin, listenForDeviceCodeAuthentication } from '../graph/graph.js'
import { COLORS_FOCUS, COLORS_PRIMARY, COLORS_SUCCESS, COLORS_WARNING } from '../constants/constants.js'
import { SigninError } from '../errors/errors.js'
import { SigninHelp } from './SigninHelp.jsx'
import Spinner from 'ink-spinner'

/**
 * @function Account
 * @description A form for signing in to Microsoft Teams.
 * @param {object} props The props.
 * @param {import('./App.tsx').TeamsAppsHostContext} props.hostContext - The host context.
 * @returns {import('react').ReactElement} - An instance of SigninForm.
 */
export function Account ({ hostContext }) {
  try {
    const content = []
    const [
      /** {import('../authentication/authentication.js').DeviceCodePayload | null} */
      deviceCodePayload,
      /**
       * @function setDeviceCodePayload
       * @description Sets the device code payload.
       * @param {import('../authentication/authentication.js').DeviceCodePayload} value - The value to set.
       * @returns {void}
       */
      setDeviceCodePayload
    ] = useState(null)
    const [
      /** {number} */
      elapsed,
      /**
       * @function setElapsed
       * @description Sets the elapsed time.
       * @param {number} value - The value to set.
       */
      setElapsed
    ] = useState(0)

    useEffect(() => {
      /**
       * @function initializeSignin
       * @description Initializes the sign-in process by acquiring a device code.
       * @returns {Promise<void>}
       */
      async function initializeSignin () {
        try {
          /** {import('../authentication/authentication.js').DeviceCodePayload} */
          const deviceCode = await signin()
          setDeviceCodePayload(deviceCode)
          clipboard.writeSync(deviceCode.user_code)
        } catch (error) {
          throw new SigninError('Unable to acquire a device code', { cause: error })
        }
      }
      /**
       * @function waitForAuthentication
       * @description Waits for the user to authenticate.
       * @returns {Promise<void>}
       */
      async function waitForAuthentication () {
        let authenticationCheckTimer = null
        const AUTHENTICATION_CHECK_INTERVAL = 2000
        authenticationCheckTimer = setTimeout(
          async function checkAuthenticationStatus () {
            if (elapsed <= deviceCodePayload.expires_in) {
              setElapsed(elapsed + AUTHENTICATION_CHECK_INTERVAL / 1000)
              let authenticationPayload = null
              try {
                authenticationPayload = await listenForDeviceCodeAuthentication(deviceCodePayload)
                if (!authenticationPayload) { // Authentication is pending
                  return () => { clearTimeout(authenticationCheckTimer) }
                } else {
                  return () => { clearTimeout(authenticationCheckTimer) }
                }
              } catch (error) {
                logger.warn(`Error listening for device code authentication: ${inspect(error)}`)
                return () => { clearTimeout(authenticationCheckTimer) }
              }
            } else {
              setDeviceCodePayload(null)
              return () => { clearTimeout(authenticationCheckTimer) }
            }
          }, AUTHENTICATION_CHECK_INTERVAL)
      }
      if (hostContext.isSignedIn) {
        hostContext.setAppTitle('Your Account')
        return () => { }
      } else {
        if (!deviceCodePayload) {
          hostContext.setAppTitle('Sign in to Microsoft Teams (loading)')
          initializeSignin()
        } else {
          hostContext.setAppTitle('Sign in to Microsoft Teams')
          waitForAuthentication()
        }
      }
    }, [deviceCodePayload, elapsed])

    if (hostContext.isSignedIn) {
      content.push(
        <Box key='signin-success' flexDirection='column' alignItems='center' justifyContent='center'>
          <InkAsciifyImage
            key='teams-logo'
            url='src/assets/teams-logo.png'
            width={40}
            height={20}
            tryCorrectAspectRatio={false}
            renderInTwoBit={false}
            alt='Oops! I cannot display the image'
          />
          <Newline />
          <Box
            borderStyle='round'
            borderColor={COLORS_SUCCESS}
            paddingY={1}
            paddingX={2}
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
          >
            <Text color={COLORS_SUCCESS} bold>You are now signed in!</Text>
          </Box>
        </Box>
      )
    } else {
      if (!deviceCodePayload) {
        content.push(
          <Box key='signin-waiting' flexDirection='column' alignItems='center' justifyContent='center'>
            <InkAsciifyImage
              key='teams-logo'
              url='src/assets/teams-logo.png'
              width={40}
              height={20}
              tryCorrectAspectRatio={false}
              renderInTwoBit={false}
              alt='Oops! I cannot display the image'
            />
            <Newline />
            <Text color='yellow'>
              <Spinner type='dots' />Generating an authentication link...
            </Text>
          </Box>
        )
      } else {
        content.push(
          <Box key='signin-instructions' flexDirection='column' alignItems='center' justifyContent='center'>
            <InkAsciifyImage
              key='teams-logo'
              url='src/assets/teams-logo.png'
              width={40}
              height={20}
              tryCorrectAspectRatio={false}
              renderInTwoBit={false}
              alt='Oops! I cannot display the image'
            />
            <Newline />
            <Text color={COLORS_PRIMARY}>To sign in, open this page:</Text>
            <Box borderStyle='single' paddingY={1} paddingX={2} flexDirection='column' alignItems='center' justifyContent='center'>
              <Text color={COLORS_FOCUS} bold>{deviceCodePayload.verification_uri}</Text>
            </Box>
            <Newline />
            <Text color={COLORS_PRIMARY}>Then enter this code:</Text>
            <Box borderStyle='single' paddingY={1} paddingX={2} flexDirection='column' alignItems='center' justifyContent='center'>
              <Text color={COLORS_FOCUS} bold>{deviceCodePayload.user_code}</Text>
            </Box>
            <Newline />
            <Text color={COLORS_WARNING} italic>N.B: This code expires in {deviceCodePayload.expires_in - elapsed} seconds.</Text>
          </Box>
        )
      }
    }
    return (
      <Box key='ACCOUNT' flexDirection='row' width='100%' height={process.stdout.rows - 6}>
        <Box
          width='100%'
          justifyContent='center'
          borderStyle='single'
          borderLeft={false}
          borderBottom={false}
          borderTop={false}
        >
          {content}
        </Box>
        <Box width='100%' justifyContent='center'>
          <SigninHelp />
        </Box>
      </Box>
    )
  } catch (error) {
    throw new SigninError('Error rendering SigninForm', { cause: error })
  }
}
