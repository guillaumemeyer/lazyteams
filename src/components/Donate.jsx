import { inspect } from 'node:util'
import { logger } from '../logger/logger.js'
import React from 'react'
import { Text } from 'ink'
import Link from 'ink-link'
import { COLORS_PRIMARY, DONATION_URL } from '../constants/constants.js'

export const Donate = () => {
  try {
    logger.debug('Rendering Donate')
    return (
      <Text color={COLORS_PRIMARY} italic>{DONATION_URL}</Text>
      // <Link url={DONATION_URL}>
      //   <Text color={COLORS_PRIMARY}>Donate</Text>
      // </Link>
    )
  } catch (error) {
    logger.error(`Error rendering Donate: ${inspect(error)}`)
    throw error
  }
}
