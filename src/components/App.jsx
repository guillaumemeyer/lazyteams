import React, { useState, useEffect } from 'react'
import { Box, useInput, useStdin, Spacer } from 'ink'
import { Brand } from './Brand.jsx'
import { AppTitle } from './AppTitle.jsx'
import { AccountStatus } from './AccountStatus.jsx'
import { NavigationHelp } from './NavigationHelp.jsx'
import { About } from './About.jsx'
import { Help } from './Help.jsx'
import { Chat } from './Chat.jsx'
import { Donate } from './Donate.jsx'
import { Teams } from './Teams.jsx'
import { Account } from './Account.jsx'
import { Rail } from './Rail.jsx'
import { getSigninStatus, getMyProfile } from '../graph/graph.js'
import { COLORS_PRIMARY } from '../constants/constants.js'
import * as ERRORS from '../errors/errors.js'
import { LastKeystroke } from './LastKeystroke.jsx'

/**
 * @typedef {Map<TeamsAppKey, TeamsApp>} TeamsApps
 */

/** @typedef {'help'|'about'|'account'|'chat'|'teams'} TeamsAppKey - The app key */

/**
 * @typedef {object} TeamsApp - The app object
 * @property {TeamsAppKey} key - The app key
 * @property {'top'|'bottom'} railPosition - The app rail position
 * @property {string} [railTitle] - The app rail title
 */

/**
 * @typedef {object} TeamsAppsHostContext - The teams apps host context
 * @property {boolean} isSignedIn - The signed-in status
 * @property {object} userProfile - The user profile
 * @property {function} setAppTitle - The app title setter
 * @property {function} setContextualHelp - The contextual help setter
 */

/**
 * @function App
 * @returns {import('react').ReactElement} - React component
 * @throws {Error} - Thrown if an error is encountered
 */
export const App = () => {
  try {
    const globalHelpMEssage = 'alt+q: quit'

    /**
     * @type {TeamsApps}
     * @description Map of teams apps
     */
    const teamsApps = new Map()
    teamsApps.set('chat', {
      key: 'chat',
      railPosition: 'top',
      railTitle: 'Chat'
    })
    teamsApps.set('teams', {
      key: 'teams',
      railPosition: 'top',
      railTitle: 'Teams'
    })
    teamsApps.set('account', {
      key: 'account',
      railPosition: 'bottom',
      railTitle: 'Account'
    })
    teamsApps.set('about', {
      key: 'about',
      railPosition: 'bottom',
      railTitle: 'About'
    })
    teamsApps.set('help', {
      key: 'help',
      railPosition: 'bottom',
      railTitle: 'Help'
    })

    const [
      /** @type {boolean} */
      isSignedIn,
      setIsSignedIn
    ] = useState(false)
    const [userProfile, setUserProfile] = useState({})
    const [
      /** @type {TeamsAppKey} */
      activeTeamsApp,
      /**
       * @function setActiveTeamsApp
       * @param {TeamsAppKey} value - The value to set
       * @returns {void}
       */
      setActiveTeamsApp
    ] = useState(teamsApps.get('account').key)
    const [
      /** @type {string} */
      lastKeystroke,
      setLastKeystroke
    ] = useState('')
    const [activeTeamsAppTitle, setActiveTeamsAppTitle] = useState('')
    const [activeTeamsAppHelp, setActiveTeamsAppHelp] = useState('')

    const [
      /** @type {TeamsAppsHostContext} */
      teamsAppsHostContext,
      setTeamsAppsHostContext
    ] = useState({
      isSignedIn,
      userProfile,
      setAppTitle: setActiveTeamsAppTitle,
      setContextualHelp: setActiveTeamsAppHelp
    })

    // useEffect(() => {
    //   async function initialize () {
    //     const isSignedIn = await getSigninStatus()
    //     setIsSignedIn(isSignedIn)
    //     if (isSignedIn) {
    //       const userProfile = await getMyProfile()
    //       setUserProfile(userProfile)
    //     }
    //     setActiveTeamsApp(isSignedIn ? 'chat' : 'account')
    //     return () => { }
    //   }
    //   initialize()
    // })

    const stdin = useStdin()
    if (stdin.isRawModeSupported) {
      useInput((input, key) => { // eslint-disable-line
        const controlKeys = []
        Object.keys(key).forEach((k) => {
          if (key[k] === true) { controlKeys.push(k) }
        })
        setLastKeystroke(`${JSON.stringify(controlKeys)} + ${input}`)
        if (key.meta && input === 'q') { process.exit(0) }
      })
    }

    return (
      <Box key='TUI' width='100%' height='100%' flexDirection='column'>
        <Box
          key='HEADER'
          width='100%'
          flexDirection='row'
          borderStyle='bold'
          borderColor={COLORS_PRIMARY}
          paddingX={1}
        >
          <Box justifyContent='flex-start'><Brand /></Box>
          <Spacer />
          <Box justifyContent='center'><AppTitle title={activeTeamsAppTitle} /></Box>
          <Spacer />
          <Box justifyContent='flex-end'><AccountStatus isSignedIn={isSignedIn} userProfile={userProfile} /></Box>
        </Box>
        <Box
          key='BODY'
          flexDirection='row'
          width='100%'
          height={activeTeamsAppHelp !== '' ? process.stdout.rows - 9 : process.stdout.rows - 6}
        >
          <Rail
            teamsApps={teamsApps}
            activeTeamsApp={activeTeamsApp}
            setActiveTeamsApp={setActiveTeamsApp}
          />
          <Box key='APP_HOST' flexDirection='column' width='100%' height='100%' borderStyle='round' paddingX={1}>
            {activeTeamsApp === 'chat' && <Chat hostContext={teamsAppsHostContext} />}
            {activeTeamsApp === 'teams' && <Teams hostContext={teamsAppsHostContext} />}
            {activeTeamsApp === 'account' && <Account hostContext={teamsAppsHostContext} />}
            {activeTeamsApp === 'about' && <About hostContext={teamsAppsHostContext} />}
            {activeTeamsApp === 'help' && <Help hostContext={teamsAppsHostContext} />}
          </Box>
        </Box>
        <Box
          key='FOOTER'
          width='100%'
          flexDirection='column'
          borderStyle='round'
          borderColor={COLORS_PRIMARY}
          paddingX={1}
        >
          <Box key='CONTEXTUAL_HELP' display={activeTeamsAppHelp !== '' ? 'flex' : 'none'}>
            <NavigationHelp message={activeTeamsAppHelp} />
          </Box>
          <Box key='STATUS_BAR' flexDirection='row'>
            <Box justifyContent='flex-start'><NavigationHelp message={globalHelpMEssage} /></Box>
            <Spacer />
            {/* <Box justifyContent='center'><LastKeystroke lastKeystroke={lastKeystroke} setLastKeystroke={setLastKeystroke} /></Box> */}
            <Spacer />
            <Box justifyContent='flex-end'><Donate /></Box>
          </Box>
        </Box>
      </Box>
    )
  } catch (error) {
    throw new ERRORS.TuiError('Error rendering TUI', { cause: error })
  }
}
