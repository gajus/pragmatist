# Pragmatist

A collection of tasks to standardise builds.

## Tasks

Tasks that are not documented (including dependencies of the documented tasks that are not documented) are considered private and can be changed/renamed or removed without a warning.

#### `lint`

* Uses [Canonical](https://github.com/gajus/canonical) to lint all `*.js` files in `./src` and `./dist` directories.

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

Runs `lint`, `test` tasks every time `./src/**/*.js` or `./tests/**/*.js` changes.

#### `watch-test`

Runs `test` task every time `./src/**/*.js` or `./tests/**/*.js` changes.

#### `watch-lint`

Runs `lint` task every time `./src/**/*.js` or `./tests/**/*.js` changes.

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

## NPM

A typical project using `pragmatist` will define the following NPM scripts:

```json
"scripts": {
    "pragmatist": "node ./node_modules/.bin/pragmatist",
    "build": "npm run pragmatist build",
    "lint": "npm run pragmatist lint",
    "test": "npm run pragmatist test"
},
```

## Ignore Unnecessary Files

This is just a reminder. Pragmatist will produce several files that you do not want to commit to the repository or include in the npm bundle.

Add to `.gitignore`:

```
node_modules
coverage
*.log
```

Add to `.npmignore`

```
src
tests
coverage
.travis.yml
.eslintrc
*.log
```
