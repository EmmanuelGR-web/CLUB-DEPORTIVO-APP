'use client';

// =====================================================================
// AuthContexto.tsx
// -----------------------------------------------------------------------
// Maneja la sesión del usuario logueado en toda la aplicación. Guarda
// el token JWT en localStorage (para que la sesión sobreviva a un
// refresh de página) y expone funciones simples para loguearse,
// registrarse y cerrar sesión, sin que cada pantalla tenga que saber
// el detalle de cómo se guarda o valida el token.
// =====================================================================

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { UsuarioSesion } from '@/tipos';
import { autenticacionServicio } from '@/servicios/autenticacionServicio';

const CLAVE_TOKEN = 'club-san-martin:token';
const CLAVE_USUARIO = 'club-san-martin:usuario';

interface AuthContextoValor {
  usuario: UsuarioSesion | null;
  cargando: boolean;
  iniciarSesion: (email: string, contrasena: string) => Promise<void>;
  registrarse: (datos: {
    nombre: string;
    apellido: string;
    email: string;
    contrasena: string;
    telefono?: string;
    fechaNacimiento?: string;
    ciudad?: string;
    provincia?: string;
    direccion?: string;
  }) => Promise<void>;
  cerrarSesion: () => void;
}

const AuthContexto = createContext<AuthContextoValor | undefined>(undefined);

export function AuthProveedor({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  // Al cargar la app, revisa si ya había una sesión guardada de una
  // visita anterior, para no obligar a loguearse de nuevo en cada
  // refresh de página.
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem(CLAVE_USUARIO);
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  function guardarSesion(token: string, datosUsuario: UsuarioSesion) {
    localStorage.setItem(CLAVE_TOKEN, token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  }

  async function iniciarSesion(email: string, contrasena: string) {
    const respuesta = await autenticacionServicio.login(email, contrasena);
    guardarSesion(respuesta.tokenAcceso, respuesta.usuario);
    router.push('/mi-carnet');
  }

  async function registrarse(datos: {
    nombre: string;
    apellido: string;
    email: string;
    contrasena: string;
    telefono?: string;
    fechaNacimiento?: string;
    ciudad?: string;
    provincia?: string;
    direccion?: string;
  }) {
    const respuesta = await autenticacionServicio.registro(datos);
    guardarSesion(respuesta.tokenAcceso, respuesta.usuario);
    router.push('/mi-carnet');
  }

  function cerrarSesion() {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    setUsuario(null);
    router.push('/login');
  }

  return (
    <AuthContexto.Provider value={{ usuario, cargando, iniciarSesion, registrarse, cerrarSesion }}>
      {children}
    </AuthContexto.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContexto);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un AuthProveedor');
  }
  return contexto;
}
