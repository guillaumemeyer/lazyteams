/**
 * @class AppError
 * @augments {Error}
 * @description Error class for application errors
 */
export class AppError extends Error {
  /**
   * @param {string} message - The error message
   * @param {object} [options] - The options
   * @param {Error} [options.cause] - The cause of the error
   * @throws {Error} - Thrown if an error is encountered
   */
  constructor (message, { cause } = { cause: undefined }) {
    super(message, { cause })
    this.name = this.constructor.name
  }
}

/**
 * @class TuiError
 * @augments {AppError}
 * @description Error class for TUI errors
 */
export class TuiError extends AppError {
  constructor (message, { cause } = { cause: undefined }) {
    super(message, { cause })
    this.name = this.constructor.name
  }
}

/**
 * @class AuthenticationError
 * @augments {AppError}
 * @description Error class for authentication errors
 */
export class AuthenticationError extends AppError {
  /**
   * @param {string} message - The error message
   * @param {object} [options] - The options
   * @param {Error} [options.cause] - The cause of the error
   * @throws {Error} - Thrown if an error is encountered
   */
  constructor (message, { cause } = { cause: undefined }) {
    super(message, { cause })
    this.name = this.constructor.name
  }
}

/**
 * @class SigninError
 * @augments {AuthenticationError}
 * @description Error class for signin errors
 */
export class SigninError extends AuthenticationError {
  /**
   * @param {string} message - The error message
   * @param {object} [options] - The options
   * @param {Error} [options.cause] - The cause of the error
   * @throws {Error} - Thrown if an error is encountered
   */
  constructor (message, { cause } = { cause: undefined }) {
    super(message, { cause })
    this.name = this.constructor.name
  }
}
