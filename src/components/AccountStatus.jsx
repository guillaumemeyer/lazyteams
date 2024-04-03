import { inspect } from 'node:util'
import { logger } from '../logger/logger.js'
import React from 'react'
import { Badge } from '@inkjs/ui'
import { COLORS_SUCCESS, COLORS_WARNING, COLORS_ERROR } from '../constants/constants.js'

/**
 * @function AccountStatus
 * @description The account status component.
 * @param {object} props - The props.
 * @param {boolean} props.isSignedIn - The signed-in status.
 * @param {object} props.userProfile - The user profile.
 * @returns {import('react').ReactElement} - React component.
 */
export function AccountStatus ({ isSignedIn, userProfile }) {
  try {
    if (isSignedIn) {
      if (userProfile.displayName) {
        return <Badge color={COLORS_SUCCESS}>{userProfile.displayName}</Badge>
      } else {
        return <Badge color={COLORS_WARNING}>Signed in (no display name)</Badge>
      }
    } else {
      return <Badge color={COLORS_ERROR}>Not signed in</Badge>
    }
  } catch (error) {
    logger.error(`Error rendering SigninStatus: ${inspect(error)}`)
    throw error
  }
}
