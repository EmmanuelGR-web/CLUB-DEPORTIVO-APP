// =====================================================================
// tailwind.config.ts
// -----------------------------------------------------------------------
// Acá viven los "tokens" de diseño de toda la app: colores, tipografías
// y demás valores reutilizables. Definirlos en un solo lugar evita
// que cada componente invente su propio rojo o su propia tipografía,
// y hace que cambiar la identidad visual del club en el futuro sea
// cuestión de tocar este archivo, no cientos de componentes sueltos.
// =====================================================================

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // el modo oscuro se activa agregando la clase "dark" al <html>
  // Solo el panel de administración sigue con Tailwind. El portal de
  // socios usa Bootstrap, así que se excluye para que las clases de uno
  // y otro (border, shadow, rounded...) no se pisen.
  content: ['./src/app/**/admin/**/*.{ts,tsx}', './src/componentes/ui/**/*.{ts,tsx}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        // Paleta sacada del escudo real del club, no genérica.
        rojo: {
          club: '#b81629', // rojo principal del escudo
          profundo: '#870c1b', // para fondos oscuros y degradés
          claro: '#be384a',
        },
        hueso: '#F7F5F2', // fondo claro, blanco cálido
        carbon: {
          DEFAULT: '#1C1B1A', // fondo modo oscuro
          suave: '#28201F',
        },
        dorado: '#C9A227', // acento, asociado a categoría "Oro"
        plata: '#9CA3AF',
        bronce: '#B5691B',
      },
      fontFamily: {
        // Condensada con carácter deportivo para títulos.
        titulo: ['var(--font-barlow)', 'sans-serif'],
        // Sans limpia para texto de lectura.
        cuerpo: ['var(--font-inter)', 'sans-serif'],
        // Monoespaciada para números de socio y códigos de barra.
        dato: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
