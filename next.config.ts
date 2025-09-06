import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Désactiver ESLint pendant les builds
    eslint: {
        ignoreDuringBuilds: true,
    
    },
    typescript: {
        ignoreBuildErrors: true,
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
        // Désactiver le redimensionnement pour les images externes problématiques
        domains: ['s7g3.scene7.com'],
      },
};

export default nextConfig;
