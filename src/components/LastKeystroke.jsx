import React, { useEffect } from 'react'
import { Text } from 'ink'
import PropTypes from 'prop-types'

/**
 * @function LastKeystroke
 * @description The last keystroke
 * @param {object} props - The props
 * @param {string} props.lastKeystroke - The last keystroke
 * @param {function} props.setLastKeystroke - The last keystroke setter
 * @returns {import('react').ReactElement} - React component
 */
export const LastKeystroke = ({ lastKeystroke, setLastKeystroke }) => {
  useEffect(() => {
    const timer = setInterval(async () => {
      setLastKeystroke('')
    }, 2000)
    return () => {
      clearInterval(timer)
    }
  }, [lastKeystroke])
  return (
    <Text italic>{lastKeystroke}</Text>
  )
}
LastKeystroke.propTypes = {
  lastKeystroke: PropTypes.string.isRequired,
  setLastKeystroke: PropTypes.func.isRequired
}
