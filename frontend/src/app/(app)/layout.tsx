import { RutaProtegida } from '@/componentes/RutaProtegida';
import { PanelSocio } from '@/componentes/socio/PanelSocio';

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <RutaProtegida>
      <PanelSocio>{children}</PanelSocio>
    </RutaProtegida>
  );
}
