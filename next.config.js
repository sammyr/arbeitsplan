/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Optimiert für Produktions-Deployment
  poweredByHeader: false, // Entfernt den X-Powered-By Header für bessere Sicherheit
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Entfernt console.log im Produktionsbuild
  },
};

module.exports = nextConfig;
