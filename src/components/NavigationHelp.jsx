import { inspect } from 'node:util'
import { logger } from '../logger/logger.js'
import React from 'react'
import { Text } from 'ink'
import PropTypes from 'prop-types'

/**
 * @function NavigationHelp
 * @description The navigation help component.
 * @param {object} props - The props.
 * @param {string} props.message - The message.
 * @returns {import('react').ReactElement} - React component.
 */
export const NavigationHelp = ({ message }) => {
  try {
    logger.debug('Rendering NavigationHelp')
    return (
      <Text italic color='green'>{message}</Text>
    )
  } catch (error) {
    logger.error(`Error rendering NavigationHelp: ${inspect(error)}`)
    throw error
  }
}
NavigationHelp.propTypes = {
  message: PropTypes.string.isRequired
}
