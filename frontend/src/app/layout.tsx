import type { Metadata, Viewport } from 'next';
import { Inter, Rajdhani, JetBrains_Mono } from 'next/font/google';
import { TemaProveedor } from '@/contextos/TemaContexto';
import { AuthProveedor } from '@/contextos/AuthContexto';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import '@/estilos/club.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
// Rajdhani para títulos y credencial: condensada, con aire deportivo.
const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-rajdhani',
});
// Monoespaciada para números de socio, DNI y montos.
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'Portal de socios | Club Deportivo',
  description:
    'Portal de socios del Club Deportivo: carnet digital, cuota social, comprobantes de pago y datos personales.',
  icons: { icon: '/logo.png', apple: '/logo.png' },
};

export const viewport: Viewport = {
  themeColor: '#7a0f2e',
};

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-bs-theme="light" suppressHydrationWarning>
      <body className={`${inter.variable} ${rajdhani.variable} ${jetbrains.variable}`}>
        <TemaProveedor>
          <AuthProveedor>{children}</AuthProveedor>
        </TemaProveedor>
      </body>
    </html>
  );
}
