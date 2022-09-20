# Contributing

Contributions are always welcome, no matter how large or small!

## Prerequisites

- Node.js >= v14.15
- Yarn - latest version is alright

## Setup

On your first checkout of the repository, you'll need to install dependencies
and run the project.

### Node.js

Contributing to the `Fotos` app, requires Node.js and Yarn installed on your
machine. We suggest
[installing Node.js with nvm](https://github.com/nvm-sh/nvm), and Yarn can later
be installed with `npm install -g yarn`.

Once setup, install dependencies build initial packages.

```bash
yarn install || yarn
yarn start
yarn android
```

## How to

### Open development

All development on Fotos happens directly on GitHub. Both core team members and
external contributors send pull requests which go through the same review
process.

### Branch organization

Submit all pull requests directly to the `main` branch. We only use separate
branches for upcoming releases / breaking changes, otherwise, everything points
to `main`.

Code that lands in `main` must be compatible with the latest stable release. It
may contain additional features, but no breaking changes. We should be able to
release a new minor version from the tip of master at any time.

### Semantic versions

We utilize Yarn's
[release workflow](https://yarnpkg.com/features/release-workflow) for declaring
version bumps and releasing packages. To enforce this standard, we have CI
checks that will fail if a package has been modified, but a version bump has not
been declared.

### Reporting a bug

Please report bugs using the
[official issue template](https://github.com/functionland/fotos), only after you
have previously searched for the issue and found no results. Be sure to be as
descriptive as possible and to include all applicable labels.

The best way to get your bug fixed is to provide a reduced test case. Please
provide a public repository with a runnable example, or a usable code snippet.

### Requesting new functionality

Before requesting new functionality, view the
[roadmap and backlog](https://github.com/functionland/fotos) as your request may
already exist. If it does not exist, submit an
[issue using the official template](https://github.com/functionland/fotos). Be
sure to be as descriptive as possible and to include all applicable labels.

### Submitting a pull request

We accept pull requests for all bugs, fixes, improvements, and new features.
Before submitting a pull request, be sure your build passes locally using the
development workflow below.

#### Type checking

Type checking is performed by [TypeScript](https://www.typescriptlang.org/). We
prefer to run this first, as valid typed code results in valid tests and lints.

#### Testing

Tests are written with [Jest](https://jestjs.io/). For every function or class,
we expect an associated `*.test.ts` test file in the package's tests folder. We
also write unit tests, not integration tests.

#### Linting

Linting is performed by [ESLint](https://eslint.org/). Most rules are errors,
but those that are warnings should _not_ be fixed, as they are informational.
They primarily denote browser differences and things that should be polyfilled.

#### Formatting

Code formatting is performed by [Prettier](https://prettier.io/). We prefer to
run Prettier within our code editors using `format-on-save` functionality.
