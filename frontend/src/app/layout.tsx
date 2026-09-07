import type { Metadata } from 'next';
import { Barlow_Condensed, Inter, IBM_Plex_Mono } from 'next/font/google';
import { TemaProveedor } from '@/contextos/TemaContexto';
import { AuthProveedor } from '@/contextos/AuthContexto';
import './globals.css';


const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'CLUB DEPORTIVO | Portal de Socios',
  description: 'Portal de socios de CLUB DEPORTIVO',
};

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${barlow.variable} ${inter.variable} ${plexMono.variable}`}>
        <TemaProveedor>
          <AuthProveedor>{children}</AuthProveedor>
        </TemaProveedor>
      </body>
    </html>
  );
}
