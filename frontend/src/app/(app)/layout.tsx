import { RutaProtegida } from '@/componentes/RutaProtegida';
import { BarraLateral } from '@/componentes/BarraLateral';

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <RutaProtegida>
      <div className="flex min-h-screen flex-col bg-hueso dark:bg-carbon md:flex-row">
        <BarraLateral />
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">{children}</main>
      </div>
    </RutaProtegida>
  );
}
