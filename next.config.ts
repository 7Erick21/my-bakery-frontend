import type { NextConfig } from 'next';
import type { Configuration, RuleSetRule } from 'webpack';

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      }
    ]
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  reactStrictMode: true,
  typedRoutes: true,
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  },
  webpack(config: Configuration) {
    const rules = config.module?.rules as RuleSetRule[];
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = rules.find(
      (rule: RuleSetRule) => rule.test instanceof RegExp && rule.test.test('.svg')
    ) as RuleSetRule;

    rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/ // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        resourceQuery: { not: /url/ }, // exclude if *.svg?url
        use: ['@svgr/webpack']
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  }
};

export default nextConfig;
