import { inspect } from 'node:util'
import { logger } from '../logger/logger.js'
import React from 'react'
import { Text } from 'ink'

export const LiveStatus = () => {
  try {
    logger.debug('Rendering LiveStatus')
    return (
      <Text color='blue' bold>LiveStatus</Text>
    )
  } catch (error) {
    logger.error(`Error rendering LiveStatus: ${inspect(error)}`)
    throw error
  }
}
