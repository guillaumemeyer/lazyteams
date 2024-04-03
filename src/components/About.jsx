import { inspect } from 'node:util'
import React from 'react'
import { Text, Box, Newline } from 'ink'
import { ABOUT, PRODUCT_NAME } from '../constants/constants.js'
import { logger } from '../logger/logger.js'
import InkAsciifyImage from 'ink-asciify-image'
import PropTypes from 'prop-types'
import Gradient from 'ink-gradient'
import BigText from 'ink-big-text'

/**
 * @function About
 * @description The about component.
 * @param {object} props - The props.
 * @param {import('./App.jsx').TeamsAppsHostContext} props.hostContext - The app context.
 * @returns {import('react').ReactElement} - React component.
 */
export function About ({ hostContext }) {
  try {
    logger.debug('Rendering About')
    return (
      <Box key='about' flexDirection='column'>
        <Gradient name='rainbow'>
          <BigText text={PRODUCT_NAME} />
        </Gradient>
        <Text>{ABOUT}</Text>
        <Newline />
        <InkAsciifyImage
          url='https://avatars.githubusercontent.com/u/1385518?v=4'
          width={40}
          height={20}
          tryCorrectAspectRatio={false}
          renderInTwoBit={false}
          alt='Oops! I cannot display the image'
        />
      </Box>
    )
  } catch (error) {
    logger.error(`Error rendering About: ${inspect(error)}`)
    throw error
  }
}
About.propTypes = {
  hostContext: PropTypes.object.isRequired
}
