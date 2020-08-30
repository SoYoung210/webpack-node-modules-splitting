module.exports = {
  presets: [
    [
      '@babel/preset-env', {
        'useBuiltIns': 'usage',
        'corejs':3,
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  exclude: [/\/core-js\//],
  plugins: [
    '@babel/plugin-transform-runtime',
    // use https://github.com/lodash/babel-plugin-lodash
  ],
};
