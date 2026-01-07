const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    domains: ["firebasestorage.googleapis.com", "storage.googleapis.com"],
  },
  trailingSlash: true,
  eslint: {
    // Deshabilitar ESLint durante builds para deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Deshabilitar type checking durante builds para deployment
    ignoreBuildErrors: true,
  },
  // Asegurarnos que las rutas dinámicas se generen correctamente
  generateBuildId: async () => {
    return "build-" + Date.now();
  },
  experimental: {
    esmExternals: "loose",
  },
  webpack: (config, { isServer }) => {
    // Prioritizar versiones de navegador de las librerías
    config.resolve.mainFields = ["browser", "module", "main"];

    // Force alias undici to mock
    config.resolve.alias = {
      ...config.resolve.alias,
      undici: path.join(__dirname, "src/mocks/undici.js"),
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        "firebase-admin": false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
