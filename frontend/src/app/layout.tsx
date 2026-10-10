import type { Metadata, Viewport } from 'next';
import { TemaProveedor } from '@/contextos/TemaContexto';
import { SesionProveedor } from '@/contextos/SesionContexto';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/estilos/global.css';

export const metadata: Metadata = {
  title: 'Portal de socios | Club Deportivo',
  description: 'Portal del Club Deportivo: carnet digital, cuota social, comprobantes, mensajes y gestión del padrón de socios.',
  authors: [{ name: 'Emmanuel Gonzalez Rojas' }],
  icons: { icon: '/logo.png', apple: '/logo.png' },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#7a0f2e',
};

// El tema se aplica antes de pintar para que no haya un parpadeo claro
// al entrar en modo oscuro.
const temaInicial = `try{var t=localStorage.getItem('club:tema');if(!t&&matchMedia('(prefers-color-scheme: dark)').matches)t='oscuro';document.documentElement.setAttribute('data-bs-theme',t==='oscuro'?'dark':'light')}catch(e){}`;

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-bs-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: temaInicial }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <TemaProveedor>
          <SesionProveedor>{children}</SesionProveedor>
        </TemaProveedor>
      </body>
    </html>
  );
}
