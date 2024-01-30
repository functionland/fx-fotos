module.exports = {
  presets: [
    [
      'module:@react-native/babel-preset',
      { useTransformReactJSXExperimental: true },
    ],
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
  plugins: [
    [
      '@babel/plugin-transform-react-jsx',
      {
        runtime: 'automatic',
      },
    ],
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    ['@babel/plugin-proposal-optional-catch-binding'],
    ['@babel/plugin-proposal-export-namespace-from'],
    'react-native-reanimated/plugin',
  ],
}
