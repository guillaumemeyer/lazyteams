import { name, description, version } from '../../package.json'

/**
 * @typedef {object} PackageInfos
 * @property {string} name - The package name.
 * @property {string} description - The package description.
 * @property {string} version - The package version.
 */

/**
 * @function getPackageInfos
 * @description Get the package infos.
 * @returns {PackageInfos} The package infos.
 */
export function getPackageInfos () {
  return {
    name,
    description,
    version
  }
}
