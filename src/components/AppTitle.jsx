import { inspect } from 'node:util'
import { logger } from '../logger/logger.js'
import React from 'react'
import PropTypes from 'prop-types'
import { Text } from 'ink'
import { COLORS_PRIMARY } from '../constants/constants.js'

/**
 * @function AppTitle
 * @description Render the title of the current app
 * @param {object} props - The component props
 * @param {string} props.title - The current app title
 * @returns {import('react').ReactElement} - The component
 * @throws {Error} - Thrown if an error is encountered
 */
export const AppTitle = ({ title }) => {
  try {
    logger.debug('Rendering AppTitle')
    return (
      <Text color={COLORS_PRIMARY} bold>{title.toUpperCase()}</Text>
    )
  } catch (error) {
    logger.error(`Error rendering AppTitle: ${inspect(error)}`)
    throw error
  }
}
AppTitle.propTypes = {
  title: PropTypes.string.isRequired
}
