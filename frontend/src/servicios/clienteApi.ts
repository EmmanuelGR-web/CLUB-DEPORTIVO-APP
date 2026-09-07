// =====================================================================
// clienteApi.ts
// -----------------------------------------------------------------------
// Función central para hablar con el backend. TODOS los servicios
// (autenticación, socios, pagos) pasan por acá, así:
//
//   1. El token JWT se agrega automáticamente, sin repetir código.
//   2. Los errores del backend se traducen a mensajes legibles.
//   3. Si el backend algún día cambia de URL, se toca un solo lugar.
// =====================================================================

const URL_BASE_API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface OpcionesPeticion extends RequestInit {
  requiereAuth?: boolean;
}

export class ErrorApi extends Error {
  constructor(
    message: string,
    public codigoEstado: number,
  ) {
    super(message);
    this.name = 'ErrorApi';
  }
}

function obtenerToken(): string | null {
  if (typeof window === 'undefined') return null; // en el servidor no hay localStorage
  return localStorage.getItem('club-san-martin:token');
}

export async function clienteApi<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const { requiereAuth = true, headers, ...resto } = opciones;

  const headersFinales: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  // Si el body NO es un FormData (ej: subida de archivos), mandamos
  // JSON. Si es FormData, dejamos que el navegador ponga el
  // Content-Type correcto solo (con el "boundary" incluido).
  if (!(resto.body instanceof FormData)) {
    headersFinales['Content-Type'] = 'application/json';
  }

  if (requiereAuth) {
    const token = obtenerToken();
    if (token) headersFinales['Authorization'] = `Bearer ${token}`;
  }

  const respuesta = await fetch(`${URL_BASE_API}${ruta}`, { ...resto, headers: headersFinales });

  if (!respuesta.ok) {
    const cuerpoError = await respuesta.json().catch(() => ({ message: 'Error desconocido' }));
    const mensaje = Array.isArray(cuerpoError.message)
      ? cuerpoError.message.join(', ')
      : cuerpoError.message;
    throw new ErrorApi(mensaje ?? 'Ocurrió un error', respuesta.status);
  }

  // Algunos endpoints (ej: DELETE) no devuelven contenido.
  const texto = await respuesta.text();
  return texto ? JSON.parse(texto) : (undefined as T);
}
