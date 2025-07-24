// webpack.config.js
module.exports = {
  resolve: {
    fallback: {
      fs: false, // To avoid issues with 'fs' module
      path: require.resolve("path-browserify"),
      os: require.resolve("os-browserify"),
      util: require.resolve("util/"),
      assert: require.resolve("assert/"),
    },
  },
};
