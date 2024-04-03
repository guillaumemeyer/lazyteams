import { inspect } from 'node:util'
import { logger } from '../logger/logger.js'
import React from 'react'
import { ComingSoon } from './ComingSoon.jsx'
import PropTypes from 'prop-types'

/**
 * @function Teams
 * @description The teams component.
 * @param {object} props - The props.
 * @param {import('./App.jsx').TeamsAppsHostContext} props.hostContext - The app context.
 * @returns {import('react').ReactElement} - React component.
 */
export function Teams ({ hostContext }) {
  try {
    hostContext.setAppTitle('Teams')
    // hostContext.setContextualHelp('Teams app help')
    return (
      <ComingSoon />
    )
  } catch (error) {
    logger.error(`Error rendering Teams: ${inspect(error)}`)
    throw error
  }
}
Teams.propTypes = {
  hostContext: PropTypes.object.isRequired
}
