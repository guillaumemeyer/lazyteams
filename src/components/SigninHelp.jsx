import { inspect } from 'node:util'
import { logger } from '../logger/logger.js'
import React from 'react'
import { Text, Box, Newline } from 'ink'
import { PRODUCT_NAME, COLORS_PRIMARY } from '../constants/constants.js'
// import Gradient from 'ink-gradient'
// import BigText from 'ink-big-text'

export const SigninHelp = () => {
  try {
    return (
      <Box
        key='signin-help'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        width='80%'
      >
        <Box
          borderStyle='round'
          borderColor={COLORS_PRIMARY}
          paddingY={1}
          paddingX={2}
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
        >
          <Text
            color={COLORS_PRIMARY}
            bold
          >
            Welcome to {PRODUCT_NAME}!
          </Text>
        </Box>
        {/* <Gradient name='rainbow'>
          <BigText text={PRODUCT_NAME} />
        </Gradient> */}
        <Newline />
        <Text italic>N.B: You should be able to just click on the link.</Text>
        <Text italic>If your terminal does&apos;t supports clickable links, copy/paste it in a browser.</Text>
        <Newline />
        <Text italic>N.B: The code should be available from your clipboard so you just have to paste it.</Text>
        <Text italic>If your terminal does&apos;t supports clipboard interactions, you will have to type it.</Text>
      </Box>
    )
  } catch (error) {
    logger.error(`Error rendering SigninHelp: ${inspect(error)}`)
    throw error
  }
}
