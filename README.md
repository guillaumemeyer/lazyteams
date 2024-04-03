![NPM Version](https://img.shields.io/npm/v/lazyteams)
![semver](https://img.shields.io/badge/semver-2.0.0-blue)

# lazyteams

## What is lazyteams?

LazyTeams is a simple Microsoft Teams chat client for the terminal, inspired by great TUI applications like [LazyDocker](https://github.com/jesseduffield/lazydocker) and [LazyGit](https://github.com/jesseduffield/lazygit).

## Why?

**Mostly for fun.**

This project is an attempt to learn more and share my experiences using:
- [Microsoft Graph Client](https://github.com/microsoftgraph/msgraph-sdk-javascript) from a cli application
- [Microsoft Dev Proxy](https://github.com/microsoft/dev-proxy) in a real-world application
- [React](https://github.com/facebook/react) and [Ink](https://github.com/facebook/react) to build a TUI.
- [Bun](https://github.com/oven-sh/bun/) toolchain: runtime, package manager, test runner, transpiler/build tool, and compiler.
- [JSDoc](https://github.com/jsdoc/jsdoc) vs [TypeScript](https://github.com/microsoft/TypeScript)

# Quickstart

## Installation and Signup

```sh
# Install using bun (npm, yarn, pnpm or any other package manager should work)
bun install -g lazyteams
# The lazyteams command is now available globally
lazyteams
```

Then follow the instructions to signin and grant permissions to the application.

# Command-line reference
See the inline help for more details:
```sh
lazyteams --help
```

# Advanced configuration

## Credentials
The storage location of credentials can be specified using the `CREDS_DIR` environment variable.
If unspecified, credentials to one of the following directories (by order of precedence):
- `$XDG_CONFIG_HOME/lazyteams/credentials`
- `$HOME/.config/lazyteams/credentials`

N.B: As of today, credentials are stored **in clear text** in a file named `credentials.json` in the specified directory.
I am still looking for an alternative to the [keytar](https://github.com/atom/node-keytar) package (used by the official Microsoft Teams desktop client) that is now deprecated...

## Logs
Logs are written to log files and the verbosity can defined through the `LOG_LEVEL` environment variable.
- `info` (default)
- `error`
- `warn`
- `debug`

The destination logging directory can be specified using the `LOG_DIR` environment variable.
If unspecified, logs are written to one of the following directories (by order of precedence):
- `$XDG_STATE_HOME/lazyteams/logs`
- `$HOME/.local/state/lazyteams/logs`

Log files are organized using the following rules:
- File name pattern: `%DATE%-lazyteams-%HOSTNAME%.log`, where the date is formatted as `YYYY-MM-DD`.
- One log file cannot exceed 50MB and is rotated every 28 days.
- An audit file is written to `audit.json` in the same directory.

# Contributing
We welcome contributions from the community. Please see our [contributing guide](contributing.md) for more details.

# License
LazyTeams is licensed under the [MIT License](http://choosealicense.com/licenses/mit/). See [LICENSE](LICENSE).  
