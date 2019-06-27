module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
  ],
  // plugins: [
  //   '@babel/plugin-syntax-dynamic-import', // async chunks support
  //   // NOTE: Using minimal es6 features
  //   // '@babel/plugin-proposal-class-properties', // https://babeljs.io/docs/en/babel-plugin-proposal-class-properties
  //   // '@babel/plugin-proposal-private-methods', // https://babeljs.io/docs/en/next/babel-plugin-proposal-private-methods.html
  //   // '@babel/plugin-proposal-optional-chaining',
  //   [ 'module-resolver', { // https://github.com/tleunen/babel-plugin-module-resolver
  //     root: [ './src' ],
  //     alias: {
  //       config: [ './src/config' ],
  //       lib: [ './src/lib' ],
  //       NanoBem: [ './src/lib/NanoBem' ],
  //       components: [ './src/components' ],
  //       helpers: [ './src/helpers' ],
  //       services: [ './src/services' ],
  //       'hardware-vendors': [ './src/hardware-vendors' ],
  //     },
  //   }],
  //   'directory-resolver', // https://github.com/mgcrea/babel-plugin-directory-resolver
  // ],
};
