import { inspect } from 'node:util'
import { logger } from '../logger/logger.js'
import React, { useState, useEffect } from 'react'
import { Box, Text, Spacer, useInput, useStdin } from 'ink'
import PropTypes from 'prop-types'
import chalk from 'chalk'
import { COLORS_FOCUS } from '../constants/constants.js'

/**
 * @function Chat
 * @description The chat component.
 * @param {object} props - The props.
 * @param {import('./App.jsx').TeamsAppsHostContext} props.hostContext - The app context.
 * @returns {import('react').ReactElement} - React component.
 */
export const Chat = ({ hostContext }) => {
  try {
    hostContext.setAppTitle('Chat')
    hostContext.setContextualHelp('Chat app help')

    const [activePane, setActivePane] = React.useState('chat-conversations')
    const [unreadMessages, setUnreadMessages] = React.useState(1)

    const stdin = useStdin()
    if (stdin.isRawModeSupported) {
      useInput((input, key) => { // eslint-disable-line
        if (activePane === 'chat-conversations') {
          if (key.rightArrow) { setActivePane('chat-messages') }
        }
        if (activePane === 'chat-messages') {
          if (key.leftArrow) { setActivePane('chat-conversations') }
        }
        if (activePane === 'compose-message') {
          if (key.escape) { setActivePane('chat-messages') }
        }
      })
    }

    useEffect(() => {
      const appTitleUnreadSuffix = unreadMessages > 0 ? ` (${unreadMessages})` : ''
      hostContext.setAppTitle(`Chat${appTitleUnreadSuffix}`)
      hostContext.setContextualHelp('')
    })

    return (
      <Box key='chat' flexDirection='row' width='100%' height='100%'>
        <Box
          key='chat-conversations'
          flexDirection='column'
          borderStyle='round'
          borderColor={activePane === 'chat-conversations' ? COLORS_FOCUS : 'grey'}
          paddingX={2}
          width={20}
          marginRight={1}
        >
          <Text color='blue' bold>Conversations</Text>
          <Text>C1</Text>
          <Text>C2</Text>
          <Text>C3</Text>
        </Box>
        <Box
          key='chat-messages'
          flexDirection='column'
          borderStyle='round'
          borderColor={activePane === 'chat-messages' ? COLORS_FOCUS : 'grey'}
          width='100%'
          paddingX={1}
        >
          <Box>
            <Text color='blue' bold>Messages</Text>
          </Box>
          <Spacer />
          <Box borderStyle='round' borderColor='grey' width='100%' paddingX={1} marginRight={1}>
            <Text>Type your message here...</Text>
            {/* <TextInput placeholder='Type your message here' /> */}
          </Box>
        </Box>
      </Box>
    )
  } catch (error) {
    logger.error(`Error rendering Chat: ${inspect(error)}`)
    throw error
  }
}
Chat.propTypes = {
  hostContext: PropTypes.object.isRequired
}
