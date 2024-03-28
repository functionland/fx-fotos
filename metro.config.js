// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')
const nodeLibs = require('node-libs-react-native')
const {createSentryMetroSerializer} = require('@sentry/react-native/dist/js/tools/sentryMetroSerializer');

// Get the default Metro configuration for the current project
const defaultConfig = getDefaultConfig(__dirname)

// Custom configuration adjustments
const customConfig = {
  serializer: {
    customSerializer: createSentryMetroSerializer(),
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    // Merging node-libs-react-native with any additional configurations
    extraNodeModules: {
      ...nodeLibs,
      crypto: require.resolve('react-native-crypto'),
    },
  },
}

// Merge your custom configuration with the default configuration
module.exports = mergeConfig(defaultConfig, customConfig)

