/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Permite mostrar las fotos de carnet que vienen de Supabase Storage
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
