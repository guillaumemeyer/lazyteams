import { inspect } from 'node:util'
import { logger } from '../logger/logger.js'
import React from 'react'
import { Text } from 'ink'
import { PRODUCT_NAME, COLORS_PRIMARY } from '../constants/constants.js'

export const Brand = () => {
  try {
    logger.debug('Rendering Brand')
    return (
      // <Text color={COLORS_PRIMARY} bold>{PRODUCT_NAME}</Text>
      <Text backgroundColor={COLORS_PRIMARY} color='white' bold> {PRODUCT_NAME} </Text>
    )
  } catch (error) {
    logger.error(`Error rendering Brand: ${inspect(error)}`)
    throw error
  }
}
