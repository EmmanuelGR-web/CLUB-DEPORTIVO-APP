// =====================================================================
// autenticacion.service.ts
// -----------------------------------------------------------------------
// Acá vive la LÓGICA de negocio de la autenticación: verificar
// credenciales y generar el token JWT. El controlador solo recibe
// la petición HTTP y le delega el trabajo a este servicio.
//
// Principio SOLID aplicado: Single Responsibility. El controlador se
// encarga de HTTP (rutas, códigos de estado), y este servicio se
// encarga de la LÓGICA (validar contraseña, armar el token).
// =====================================================================

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SociosService } from '../socios/socios.service';

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly sociosService: SociosService,
    private readonly jwtService: JwtService,
  ) {}

  // Verifica que el email exista y que la contraseña coincida
  // con el hash guardado en la base de datos.
  async validarCredenciales(email: string, contrasena: string) {
    const socio = await this.sociosService.buscarPorEmailConContrasena(email);

    if (!socio) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // bcrypt.compare compara la contraseña en texto plano contra el
    // hash guardado, SIN nunca desencriptar el hash (por seguridad,
    // las contraseñas nunca se guardan en texto plano).
    const contrasenaValida = await bcrypt.compare(contrasena, socio.contrasenaHash);

    if (!contrasenaValida) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    return socio;
  }

  // Genera el token JWT que el frontend va a guardar y mandar en
  // cada petición para demostrar que está autenticado.
  async iniciarSesion(email: string, contrasena: string) {
    const socio = await this.validarCredenciales(email, contrasena);

    const cargaUtil = {
      sub: socio.id,
      email: socio.email,
      rol: socio.rol,
    };

    return {
      tokenAcceso: this.jwtService.sign(cargaUtil),
      usuario: {
        id: socio.id,
        nombre: socio.nombre,
        apellido: socio.apellido,
        idSocio: socio.idSocio,
        rol: socio.rol,
      },
    };
  }

  // Genera un hash seguro de contraseña, usado al crear una cuenta nueva.
  async encriptarContrasena(contrasena: string): Promise<string> {
    const rondasDeSal = 10; // costo computacional del hash (mayor = más seguro pero más lento)
    return bcrypt.hash(contrasena, rondasDeSal);
  }

  // Registra un socio nuevo (alta desde la app, sin ir presencialmente
  // al club) y lo deja logueado automáticamente, devolviendo su token,
  // para que no tenga que loguearse "a mano" justo después de crear
  // la cuenta.
  async registrarSocio(datos: {
    nombre: string;
    apellido: string;
    email: string;
    contrasena: string;
    telefono?: string;
  }) {
    const contrasenaHash = await this.encriptarContrasena(datos.contrasena);

    await this.sociosService.crear({
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      contrasenaHash,
      telefono: datos.telefono,
    });

    // Reutilizamos iniciarSesion: así garantizamos que el token que se
    // genera acá es EXACTAMENTE igual al que se generaría si el socio
    // hiciera login manualmente después.
    return this.iniciarSesion(datos.email, datos.contrasena);
  }
}
