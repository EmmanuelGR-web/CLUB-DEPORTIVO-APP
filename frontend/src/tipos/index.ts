// =====================================================================
// index.ts (tipos)
// -----------------------------------------------------------------------
// Estos tipos reflejan la forma exacta de lo que devuelve la API de
// NestJS. Mantenerlos sincronizados con el backend evita errores
// tontos (como escribir "idsocio" en vez de "idSocio").
// =====================================================================

export interface UsuarioSesion {
  id: string;
  nombre: string;
  apellido: string;
  idSocio: string;
  rol: 'socio' | 'administrativo' | 'admin_principal';
}

export interface RespuestaLogin {
  tokenAcceso: string;
  usuario: UsuarioSesion;
}

export interface Carnet {
  idSocio: string;
  nombreCompleto: string;
  fotoCarnetUrl: string | null;
  antiguedadAnios: number;
  categoria: string;
  socioActivo: boolean;
  codigoBarras: string;
}

export interface EstadoCuentaItem {
  cuotaId: string;
  periodo: string;
  monto: string;
  fechaVencimiento: string;
  estadoPago: 'pendiente' | 'aprobado' | 'rechazado' | 'sin_pagar';
  // Presentes solo si ya existe un pago (vivo o rechazado) para esta
  // cuota; null si todavía no se declaró ningún pago.
  pagoId: string | null;
  numeroComprobante: string | null;
}

// Cupón/comprobante de un pago ya aprobado (ver PagosService.obtenerComprobante
// en el backend). Pensado para mostrarlo en pantalla o convertirlo a PDF.
export interface Comprobante {
  numeroComprobante: string;
  fechaEmision: string;
  socio: {
    idSocio: string;
    nombreCompleto: string;
  };
  cuota: {
    periodo: string;
  };
  medioPago: 'efectivo' | 'transferencia' | 'debito' | 'credito';
  monto: string;
}

export interface Perfil {
  id: string;
  idSocio: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  ciudad: string | null;
  provincia: string | null;
  direccion: string | null;
  fotoCarnetUrl: string | null;
}
