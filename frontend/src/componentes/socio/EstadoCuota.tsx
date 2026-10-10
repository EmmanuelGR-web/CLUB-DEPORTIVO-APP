import { Badge } from 'react-bootstrap';
import { EstadoCuentaItem } from '@/tipos';

type Estado = EstadoCuentaItem['estadoPago'] | 'vencida';

const ESTILOS: Record<Estado, { texto: string; bg: string; color?: string }> = {
  aprobado: { texto: 'Pagada', bg: 'success' },
  pendiente: { texto: 'En revisión', bg: 'warning', color: 'dark' },
  rechazado: { texto: 'Rechazada', bg: 'danger' },
  sin_pagar: { texto: 'Pendiente', bg: 'secondary' },
  vencida: { texto: 'Vencida', bg: 'primary' },
};

export function EstadoCuota({ estado }: { estado: Estado }) {
  const estilo = ESTILOS[estado];
  return (
    <Badge pill bg={estilo.bg} text={estilo.color} className="fw-semibold px-3 py-2">
      {estilo.texto}
    </Badge>
  );
}

// Una cuota sin pagar cuya fecha ya pasó se muestra como "vencida",
// aunque para el backend siga siendo "sin_pagar".
export function estadoVisible(item: EstadoCuentaItem, vencida: boolean): Estado {
  return item.estadoPago === 'sin_pagar' && vencida ? 'vencida' : item.estadoPago;
}
