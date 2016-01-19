# Pragmatist

[![NPM version](http://img.shields.io/npm/v/pragmatist.svg?style=flat-square)](https://www.npmjs.com/package/pragmatist)
[![js-canonical-style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)

A collection of tasks to standardize builds.

## Tasks

Tasks that are not documented (including dependencies of the documented tasks that are not documented) are considered private and can be changed/renamed or removed without a warning.

#### `lint`

* Uses [Canonical](https://github.com/gajus/canonical) to lint all `*.css`, `*.scss` and `*.js` files in `./src` and `./tests` directories.

#### `format-css`

* Uses [csscomb](http://csscomb.com/) to format all `*css` and `*.scss` files in `./src` directory in accordance with [Canonical](https://github.com/gajus/canonical) requirements.

#### `build`

* Copies all files from `./src` directory to `./dist`.
* Uses [Babel](https://babeljs.io/) to compile files in `./src` directory.
    * Compiled files overwrite the existing files in `./dist` directory.
    * Source Maps are stored in the `./dist` directory`.
    * Uses [`babel-plugin-lodash`](https://github.com/megawac/babel-plugin-lodash).
    * Babel compiler is configured to use [stage 0](https://babeljs.io/docs/usage/options/) ES features.

#### `test`

* Uses [Babel](https://babeljs.io/) to compile files in `./tests` directory.
* Uses [Istanbul](https://github.com/gotwarlost/istanbul) to generate test coverage.
* Uses [Mocha](https://mochajs.org/) to execute tests in `./tests` directory.

Istanbul assumes that tests are using `./src` files (as opposed to `./dist`).

Istanbul coverage report is written to the `./coverage` directory. A coverage summary is included in the CLI output.

#### `watch`

Runs `lint`, `test` and `build` tasks every time `./src/**/*.js` or `./tests/**/*.js` changes.

#### `watch-lint`

Runs `lint` task every time `./src/**/*.js` or `./tests/**/*.js` changes.

#### `watch-test`

Runs `test` task every time `./src/**/*.js` or `./tests/**/*.js` changes.

#### `watch-build`

Runs `build` task every time `./src/**/*.js` or `./tests/**/*.js` changes.

## Gulp Tasks

`pragmatist` can be used to extend your existing [gulp](https://github.com/gulpjs/gulp) tasks.

```js
import gulp from 'gulp';
import pragmatist from 'pragmatist';

/**
 * @param {Object} gulp
 * @param {string} prefix Used to prefix all pragmatist tasks.
 * @returns {undefined}
 */
pragmatist(gulp);
```

This will make all `pragmatist` tasks available under `pragmatist:` namespace, e.g.

```sh
gulp pragmatist:test
```

## CLI Program

`pragmatist` can be used as a CLI program to run all the tasks.

```sh
npm install pragmatist -g
```

Tasks can be executed by running:

```sh
pragmatist <task>
```

Just running `pragmatist` will execute the `test` task.

Multiple tasks can be executed one after the other, e.g.

```sh
pragmatist <task #1> <task #2> <task #3>
```

### ES5

The default behavior for `build` task is to compile code for [`node`](https://nodejs.org/). Specifically, for the latest version of `node`.

To compile code down to ES5, you must add `--es5` flag to the command line, e.g.

```sh
pragmatist build --es5
```

### Notifications

Use `--notifications` flag to enable OS level notifications about errors that occur during the build.

```sh
pragmatist build --notifications
```

### Types

Use `--types` flag to enable https://github.com/codemix/babel-plugin-typecheck.

```sh
pragmatist build --types
```

## NPM

A typical project using `pragmatist` will define the following NPM scripts:

```json
"scripts": {
   "pragmatist": "pragmatist",
   "lint": "npm run pragmatist lint",
   "test": "npm run pragmatist test",
   "build": "npm run pragmatist build",
   "watch": "npm run pragmatist watch",
   "watch-lint": "npm run pragmatist watch-lint",
   "watch-test": "npm run pragmatist watch-test",
   "watch-build": "npm run pragmatist watch-build"
},
```

## Ignore Unnecessary Files

This is just a reminder. Pragmatist will produce several files that you do not want to commit to the repository or include in the npm bundle.

Add to `.gitignore`:

```
node_modules
coverage
dist
*.log
.*
!.gitignore
!.npmignore
!.babelrc
!.travis.yml
```

Add to `.npmignore`

```
src
tests
coverage
.*
*.log
```
