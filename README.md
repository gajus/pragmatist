# Deprecated

This project is no longer actively maintained.

I thought Pragmatist is going to save me a lot of time – a single build program for all of my open-source projects. The primary goals were to (1) standardize build tools (unit testing, linting, code coverage), (2) reduce the configuration boilerplate and to (3) enable simple updates of these changes across all projects.

However, as the list of projects grew that depend on Pragmatist, so did the list of the dependencies and configurations that come with it. It got to the point where installing Pragmatist alone is taking more than 10 minutes. Furthermore, bundling together unit testing, linting JavaScript, linting CSS and other linters made this package increasingly susceptible to breaking changes. If proper semantic versioning were to have been followed, this package now would have a major version somewhere in hundreds. However, failing to follow semver resulted in CI failing simultaneously across all the projects that depend on Pragmatist on each new release. In the end, this required that after each update to Pragmatist all depending projects needed to be inspected and updated accordingly.

I have gone back to using the respective build tools and maintaining the respective configurations (or shareable configurations, e.g. [eslint-config-canonical](https://github.com/gajus/eslint-config-canonical)) for each project.

# Pragmatist

[![NPM version](http://img.shields.io/npm/v/pragmatist.svg?style=flat-square)](https://www.npmjs.com/package/pragmatist)
[![js-canonical-style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)

A collection of tasks to standardize builds.

## Tasks

Tasks that are not documented (including dependencies of the documented tasks that are not documented) are considered private and can be changed/renamed or removed without a warning.

#### `lint`

* Uses [Canonical](https://github.com/gajus/canonical) to lint all `*.css`, `*.scss` and `*.js` files in `./src` and `./tests` directories.

#### `fix`

<!-- * Uses [csscomb](http://csscomb.com/) to format all `*css` and `*.scss` files in `./src` directory in accordance with [Canonical](https://github.com/gajus/canonical) requirements. -->

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

Use `--type-assertions` flag to enable [runtime type assertions](https://github.com/codemix/babel-plugin-typecheck).

```sh
pragmatist build --type-assertions
```

## NPM

A typical project using `pragmatist` will define the following NPM scripts:

```json
"scripts": {
   "lint": "pragmatist lint",
   "watch-lint": "pragmatist watch-lint",
   "test": "pragmatist --type-assertions test",
   "watch-test": "pragmatist --type-assertions test",
   "build": "pragmatist --es5 build",
   "watch-build": "pragmatist --es5 watch-build"
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
