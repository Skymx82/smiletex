import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const withTM = require('next-transpile-modules')(['fabric']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuration SWC pour éviter la transpilation inutile
  compiler: {
    // Désactiver les polyfills pour les navigateurs modernes
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    // Augmenter les timeouts pour les images externes
    minimumCacheTTL: 60,
    // Désactiver le redimensionnement pour les images externes problématiques
    domains: ['s7g3.scene7.com'],
  },
  // Configuration pour résoudre les problèmes de build
  reactStrictMode: false,
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    
    // Optimisation pour les navigateurs modernes - désactiver les polyfills
    config.resolve.alias = {
      ...config.resolve.alias,
      // Éviter les polyfills pour les fonctionnalités ES6+ natives
      'core-js/modules/es.array.at': false,
      'core-js/modules/es.array.flat': false,
      'core-js/modules/es.array.flat-map': false,
      'core-js/modules/es.object.from-entries': false,
      'core-js/modules/es.object.has-own': false,
      'core-js/modules/es.string.trim-end': false,
      'core-js/modules/es.string.trim-start': false,
    };
    
    // Ajouter une règle pour gérer les importations de fabric.js
    config.module.rules.push({
      test: /fabric(\.node)?\.js$/,
      use: {
        loader: 'null-loader',
      },
    });

    // Configuration CSS nécessaire pour Tailwind
    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                ['tailwindcss', {}],
                ['autoprefixer', {}],
              ],
            },
          },
        },
      ],
    });
    
    // Ajouter une condition pour vérifier si nous sommes dans un environnement navigateur
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      child_process: false,
      net: false,
      tls: false,
      canvas: false,
      jsdom: false,
    };
    
    return config;
  },
};

export default withTM(nextConfig);
