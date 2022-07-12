# Functionland Mobile Apps Monorepo

This is the monorepo using [nx](https://nx.dev) that contains the source for the Box, File Manager, and Design System component library projects.

## Getting started with development

In the project root run `yarn install`, this will install all the required dependencies across all the projects. You will need `cocoapods`, a valid JDK installation, and Gradle 7 installed on your Mac. `nx` as a global dependency is optional.

#### To run the iOS apps in development

- `npx nx run-ios file-manager`
- `npx nx run-ios box`

#### To run the Android apps in development

- `npx nx run-android file-manager`
- `npx nx run-android box`

Running these commands will install the required the native dependencies via Gradle or Cocoapods.
