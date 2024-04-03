import React from 'react'
import PropTypes from 'prop-types'
import { Box, Spacer, Text, useInput, useStdin } from 'ink'
import { COLORS_PRIMARY } from '../constants/constants.js'

/**
 * @function Rail
 * @description The rail component.
 * @param {object} props - The props.
 * @param {import('./App.jsx').TeamsApps} props.teamsApps - The teams apps.
 * @param {string} props.activeTeamsApp - The active teams app.
 * @param {function} props.setActiveTeamsApp - The active teams app setter.
 * @returns {import('react').ReactElement} - React component.
 */
export function Rail ({
  teamsApps,
  activeTeamsApp,
  setActiveTeamsApp
}) {
  const stdin = useStdin()
  if (stdin.isRawModeSupported) {
    useInput(async (input, key) => { // eslint-disable-line
      if (key.shift && input === 'C') { setActiveTeamsApp('chat') }
      if (key.shift && input === 'T') { setActiveTeamsApp('teams') }
      if (key.shift && input === 'A') { setActiveTeamsApp('account') }
      if (key.shift && input === 'H') { setActiveTeamsApp('help') }
      switch (activeTeamsApp) {
        case 'chat':
          if (key.return) { setActiveTeamsApp('chat') }
          if (input === ' ') { setActiveTeamsApp('chat') }
          if (key.rightArrow) { setActiveTeamsApp('chat') }
          if (key.downArrow) { setActiveTeamsApp('teams') }
          if (key.upArrow) { setActiveTeamsApp('help') }
          break
        case 'teams':
          if (key.return) { setActiveTeamsApp('teams') }
          if (input === ' ') { setActiveTeamsApp('teams') }
          if (key.rightArrow) { setActiveTeamsApp('teams') }
          if (key.downArrow) { setActiveTeamsApp('account') }
          if (key.upArrow) { setActiveTeamsApp('chat') }
          break
        case 'account':
          if (key.return) { setActiveTeamsApp('account') }
          if (input === ' ') { setActiveTeamsApp('account') }
          if (key.rightArrow) { setActiveTeamsApp('account') }
          if (key.downArrow) { setActiveTeamsApp('about') }
          if (key.upArrow) { setActiveTeamsApp('teams') }
          break
        case 'about':
          if (key.return) { setActiveTeamsApp('about') }
          if (input === ' ') { setActiveTeamsApp('about') }
          if (key.rightArrow) { setActiveTeamsApp('about') }
          if (key.downArrow) { setActiveTeamsApp('help') }
          if (key.upArrow) { setActiveTeamsApp('account') }
          break
        case 'help':
          if (key.return) { setActiveTeamsApp('help') }
          if (input === ' ') { setActiveTeamsApp('help') }
          if (key.rightArrow) { setActiveTeamsApp('help') }
          if (key.downArrow) { setActiveTeamsApp('chat') }
          if (key.upArrow) { setActiveTeamsApp('about') }
          break
      }
    })
  }

  const RailApps = ({ position }) => {
    const railApps = []
    teamsApps.forEach((app) => {
      const APP_IS_ACTIVE = app.key === activeTeamsApp
      if (app.railPosition === position) {
        // Offset that componsates for the box border
        const OFFSET = !APP_IS_ACTIVE ? ' ' : ''
        railApps.push(
          <Box
            key={app.key}
            flexDirection='row'
            borderStyle='bold'
            borderLeft={APP_IS_ACTIVE ? true : false} // eslint-disable-line
            borderRight={false}
            borderTop={false}
            borderBottom={false}
            borderLeftColor='green'
            paddingX={1}
          >
            <Text
              bold={APP_IS_ACTIVE ? true : false} // eslint-disable-line
            >
              {OFFSET}{app.railTitle}{' '}
            </Text>
          </Box>
        )
      }
    })
    return (
      <Box flexDirection='column'>
        {railApps}
      </Box>
    )
  }
  RailApps.propTypes = {
    position: PropTypes.oneOf(['top', 'bottom']).isRequired
  }

  return (
    <Box
      key='RAIL'
      flexDirection='column'
      borderStyle='round'
      height='100%'
      borderColor={COLORS_PRIMARY}
      paddingRight={1}
      marginRight={1}
    >
      <RailApps position='top' /><Spacer /><RailApps position='bottom' />
    </Box>
  )
}
