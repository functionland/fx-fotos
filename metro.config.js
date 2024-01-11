// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
// eslint-disable-next-line no-undef
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    extraNodeModules: {
      // eslint-disable-next-line no-undef
      ...require('node-libs-react-native'),
      // eslint-disable-next-line no-undef
      crypto: require.resolve('react-native-crypto'),
    },
  },
}
