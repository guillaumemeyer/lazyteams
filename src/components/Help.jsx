import { inspect } from 'node:util'
import { logger } from '../logger/logger.js'
import React, { useEffect } from 'react'
import { Box } from 'ink'
import { ComingSoon } from './ComingSoon.jsx'
import PropTypes from 'prop-types'

/**
 * @function Help
 * @description The help component.
 * @param {object} props - The props.
 * @param {import('./App.jsx').TeamsAppsHostContext} props.hostContext - The app context.
 * @returns {import('react').ReactElement} - React component.
 */
export function Help ({ hostContext }) {
  try {
    useEffect(() => {
      hostContext.setAppTitle('Help')
      hostContext.setContextualHelp('')
    })

    return (
      <Box key='help'>
        <ComingSoon />
      </Box>
    )
  } catch (error) {
    logger.error(`Error rendering Help: ${inspect(error)}`)
    throw error
  }
}
Help.propTypes = {
  hostContext: PropTypes.object.isRequired
}
