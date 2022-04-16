/** @type {import('next').NextConfig} */

const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");

module.exports = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Important: return the modified config
    config.plugins.push(
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1, // disable creating additional chunks
      })
    );

    config.plugins.push(new HtmlInlineScriptPlugin());
    return config;
  },
};
