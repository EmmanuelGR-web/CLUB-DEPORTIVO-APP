import { RutaProtegida } from '@/componentes/RutaProtegida';
import { BarraLateral } from '@/componentes/BarraLateral';

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <RutaProtegida>
      <div className="flex min-h-screen bg-hueso dark:bg-carbon">
        <BarraLateral />
        <main className="flex-1 overflow-y-auto p-6 md:p-10">{children}</main>
      </div>
    </RutaProtegida>
  );
}
