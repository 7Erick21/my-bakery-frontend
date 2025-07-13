import type { NextConfig } from 'next';
import { RuleSetRule } from 'webpack';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  compiler: {
    removeConsole: true
  },
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find(
      (rule: RuleSetRule) =>
        typeof rule === 'object' && rule.test instanceof RegExp && rule.test.test('.svg')
    );

    config.module.rules.push(
      // Reaplicamos la regla SVG solo si es ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/
      },
      // Convertimos otras SVG en componentes React
      {
        test: /\.svg$/i,
        resourceQuery: { not: /url/ },
        use: ['@svgr/webpack']
      },
      // Nueva regla para importar .avif, .webp, .png, etc. como URLs
      {
        test: /\.(avif|webp|png|jpe?g|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/images/[name].[hash][ext]'
        }
      }
    );

    // Ignoramos los .svg ya que los manejamos arriba
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    return config;
  }
  // webpack(config) {
  //   // Grab the existing rule that handles SVG imports
  //   const fileLoaderRule = config.module.rules.find(
  //     (rule: RuleSetRule) =>
  //       typeof rule === 'object' && rule.test instanceof RegExp && rule.test.test('.svg')
  //   );

  //   config.module.rules.push(
  //     // Reapply the existing rule, but only for svg imports ending in ?url
  //     {
  //       ...fileLoaderRule,
  //       test: /\.svg$/i,
  //       resourceQuery: /url/ // *.svg?url
  //     },
  //     // Convert all other *.svg imports to React components
  //     {
  //       test: /\.svg$/i,
  //       resourceQuery: { not: /url/ }, // exclude if *.svg?url
  //       use: ['@svgr/webpack']
  //     },
  //     // Add rule for AVIF images
  //     {
  //       test: /\.avif$/i,
  //       use: [
  //         {
  //           loader: 'url-loader',
  //           options: {
  //             limit: 8192,
  //             fallback: 'file-loader',
  //             publicPath: '/_next/static/images/',
  //             outputPath: 'static/images/',
  //             name: '[name].[ext]'
  //           }
  //         }
  //       ]
  //     }
  //   );

  //   // Modify the file loader rule to ignore *.svg, since we have it handled now.
  //   fileLoaderRule.exclude = /\.svg$/i;

  //   return config;
  // }
};

export default nextConfig;
