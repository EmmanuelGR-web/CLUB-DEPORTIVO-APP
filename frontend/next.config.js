// URL real del backend. El navegador nunca la usa directo: le pide todo a
// /api en este mismo sitio y Next lo reenvía, así la cookie de sesión es
// propia del sitio y no de un tercero.
const URL_BACKEND = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '')

// Qué puede cargar la página (Content Security Policy). Si se colara un
// script malicioso, no podría mandar datos a otro servidor ni cargar
// código de afuera, y el sitio no se puede incrustar en otra página.
const politicaContenido = [
  "default-src 'self'",
  // Next arma la página con scripts en línea propios.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Escudos de los equipos (ESPN) e imágenes de las noticias.
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  "connect-src 'self' https://site.api.espn.com",
  "worker-src 'self' blob:",
  "frame-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

const cabecerasSeguridad = [
  { key: 'Content-Security-Policy', value: politicaContenido },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // La cámara se usa solo para la selfie del carnet.
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=(), usb=()' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // El backend gratuito puede tardar en despertar: el reenvío espera.
  experimental: { proxyTimeout: 90_000 },
  images: {
    // Permite mostrar las fotos de carnet que vienen de Supabase Storage
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async rewrites() {
    return [{ source: '/api/:ruta*', destination: `${URL_BACKEND}/:ruta*` }]
  },
  async headers() {
    return [{ source: '/:ruta*', headers: cabecerasSeguridad }]
  },
}

module.exports = nextConfig
