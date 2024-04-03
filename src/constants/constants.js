/**
 * @module Constants
 */
import { EOL } from 'node:os'
import figlet from 'figlet'
import chalk from 'chalk'
// TODO: Remove this file from the eslint exclusions once eslint supports import attributes
// See: https://nodejs.org/api/esm.html#import-specifiers
import { getPackageInfos } from './package.js' with { type: 'macro' } // eslint-disable-line

/** @type {import('./package.js').PackageInfos} */
const packageInfos = getPackageInfos()

export const PRODUCT_CODE = packageInfos.name
export const PRODUCT_NAME = 'LazyTeams'
export const PRODUCT_DESCRIPTION = packageInfos.description
export const PRODUCT_VERSION = packageInfos.version
export const PRODUCT_FQDN = 'github.com/guillaumemeyer/lazyteams'
export const PRODUCT_VAULT_URL = `https://${PRODUCT_FQDN}`
export const PRODUCT_PRIVACY_URL = `https://${PRODUCT_FQDN}/README`
export const PRODUCT_TOS_URL = `https://${PRODUCT_FQDN}/README`
export const PRODUCT_SITE_URL = `https://${PRODUCT_FQDN}/README`
export const COMPANY_NAME = 'Guillaume Meyer'
export const COMPANY_SITE_URL = 'https://x.com/guillaumemeyer'
export const DONATION_URL = 'https://www.buymeacoffee.com/guillaumemeyer'
export const COPYRIGHT = `(C) Copyright 2023-${new Date().getFullYear()} ${COMPANY_NAME} - all rights reserved.`
export const COLORS_PRIMARY = '#444791'
export const COLORS_FOCUS = 'green'
export const COLORS_SUCCESS = 'lightgreen'
export const COLORS_WARNING = 'yellow'
export const COLORS_ERROR = 'red'
export const LOGO = chalk.bgHex(COLORS_PRIMARY).bold.white(figlet.textSync(`  ${PRODUCT_NAME}  `, { font: 'Ogre' }))
export const ABOUT = chalk.italic.bold(`${PRODUCT_DESCRIPTION}${EOL}`) +
  chalk.italic(`version v${PRODUCT_VERSION}${EOL}`) +
  chalk.italic(`${COPYRIGHT}${EOL}`) +
  chalk.italic(`Learn more at ${chalk.bold.underline(PRODUCT_SITE_URL)}`)
