module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['transform-remove-console', { exclude: ['error', 'warn'] }],
    'react-native-reanimated/plugin',
  ],
}
