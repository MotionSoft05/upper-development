/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Asegurarnos que las rutas dinámicas se generen correctamente
  generateBuildId: async () => {
    return "build-" + Date.now();
  },
};

module.exports = nextConfig;
