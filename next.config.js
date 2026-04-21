/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone-Output fuer Docker-Deployment (kleineres Image)
  output: 'standalone',
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  // Images: wir liefern sie lokal; kein Next Image Optimizer im Self-Hosting
  images: { unoptimized: true },
  experimental: {
    // Serverside Build-Info fuer Health-Endpoint
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
