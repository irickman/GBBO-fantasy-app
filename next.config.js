/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is enabled by default in Next.js 13+
  experimental: {
    serverComponentsExternalPackages: ['@libsql/client', 'libsql'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle libsql native modules
      config.externals.push('@libsql/client', 'libsql');
    }
    // Ignore node binaries and native files
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });
    return config;
  },
}

module.exports = nextConfig
