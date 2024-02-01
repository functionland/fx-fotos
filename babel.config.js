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
    ['@babel/plugin-transform-optional-catch-binding'],
    ['@babel/plugin-transform-export-namespace-from'],
    'react-native-reanimated/plugin',
  ],
}
