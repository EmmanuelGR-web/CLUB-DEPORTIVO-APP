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
