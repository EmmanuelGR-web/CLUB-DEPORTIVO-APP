// =====================================================================
// autenticacion.service.ts
// -----------------------------------------------------------------------
// Login con JWT y alta online de socios. Cada rol entra a su propio
// panel: el socio a /socio, el personal administrativo a /empleado y
// la administración principal a /admin.
// =====================================================================

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SociosService } from '../socios/socios.service';
import { Socio, MedioPagoSocio } from '../socios/entidades/socio.entity';
import { RegistrarSocioDto } from '../socios/dto/registrar-socio.dto';
import { RegistroCambiosService } from '../registro-cambios/registro-cambios.service';
import { MensajesService } from '../mensajes/mensajes.service';
import { Rol } from '../../comun/enums/rol.enum';
import { CORREO_ADMINISTRACION, correoInstitucional } from '../../comun/utilidades/correos.util';

const PANEL_POR_ROL: Record<Rol, { ruta: string; rolTexto: string }> = {
  [Rol.SOCIO]: { ruta: '/socio', rolTexto: 'Socio' },
  [Rol.ADMINISTRATIVO]: { ruta: '/empleado', rolTexto: 'Personal administrativo' },
  [Rol.ADMIN_PRINCIPAL]: { ruta: '/admin', rolTexto: 'Administración principal' },
};

const EMISORES = ['bna', 'macro', 'mercadopago', 'uala'];

function medioPagoValido(medio: Record<string, unknown>): MedioPagoSocio {
  if (medio?.tipo === 'efectivo') return { tipo: 'efectivo', debitoAutomatico: false };
  if (medio?.tipo === 'tarjeta' && EMISORES.includes(String(medio.emisor)) && /^\d{4}$/.test(String(medio.ultimos4))) {
    return {
      tipo: 'tarjeta',
      debitoAutomatico: Boolean(medio.debitoAutomatico),
      emisor: String(medio.emisor),
      red: ['visa', 'mastercard', 'amex'].includes(String(medio.red)) ? String(medio.red) : null,
      ultimos4: String(medio.ultimos4),
    };
  }
  throw new BadRequestException('Elegí un método de pago válido.');
}

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly sociosService: SociosService,
    private readonly jwtService: JwtService,
    private readonly registro: RegistroCambiosService,
    private readonly mensajes: MensajesService,
    private readonly fuente: DataSource,
  ) {}

  usuarioDeSesion(socio: Socio) {
    return {
      id: socio.id,
      nombre: socio.nombreCompleto,
      email: socio.email,
      idSocio: String(socio.idSocio),
      rol: socio.rol,
      ...PANEL_POR_ROL[socio.rol],
    };
  }

  async iniciarSesion(email: string, contrasena: string) {
    const socio = await this.sociosService.buscarPorEmailConContrasena(email);
    // Mismo mensaje si no existe el correo o si la contraseña es otra,
    // para no revelar qué correos están registrados.
    if (!socio || !(await bcrypt.compare(contrasena, socio.contrasenaHash))) {
      throw new UnauthorizedException('Revisá el correo y la contraseña e intentá de nuevo.');
    }
    if (!socio.activo) throw new UnauthorizedException('La cuenta está dada de baja. Comunicate con la secretaría del club.');

    return {
      tokenAcceso: this.jwtService.sign({ sub: socio.id, email: socio.email, rol: socio.rol }),
      usuario: this.usuarioDeSesion(socio),
    };
  }

  encriptarContrasena(contrasena: string) {
    return bcrypt.hash(contrasena, 10);
  }

  // Alta online: el socio queda "En validación" hasta que el personal
  // compara sus datos con el DNI. El pedido aparece en Solicitudes.
  async registrarSocio(datos: RegistrarSocioDto) {
    const contrasenaHash = await this.encriptarContrasena(datos.contrasena);
    const medioPago = medioPagoValido(datos.medioPago);

    const socio = await this.fuente.transaction(async (gestor) => {
      const nuevo = await this.sociosService.crear(
        {
          nombre: datos.nombre,
          apellido: datos.apellido,
          email: datos.email,
          contrasenaHash,
          dni: datos.dni,
          fechaNacimiento: datos.fechaNacimiento,
          direccion: datos.direccion,
          telefono: datos.telefono,
          foto: datos.foto,
          medioPago,
          lecturaIA: datos.lecturaIA ?? null,
          estado: 'En validación',
        },
        gestor,
      );

      await this.registro.registrar(
        {
          socioId: nuevo.id,
          socioNombre: nuevo.nombreCompleto,
          seccion: 'Alta de socio',
          cambios: [{ campo: 'Estado', anterior: '—', nuevo: 'Registrado desde la web' }],
          pendiente: true,
        },
        gestor,
      );

      await this.mensajes.crearHilo(
        nuevo.id,
        'socio',
        {
          autorId: null,
          delClub: true,
          de: CORREO_ADMINISTRACION,
          para: correoInstitucional(nuevo.nombreCompleto, String(nuevo.idSocio)),
        },
        {
          asunto: 'Recibimos tu solicitud de alta',
          texto: `Hola, ${nuevo.nombre}. Gracias por asociarte al club. El personal va a validar tus datos con las fotos de tu DNI y te avisamos por acá cuando tu carnet digital quede activo.`,
        },
        gestor,
      );
      return nuevo;
    });

    return { id: socio.id, nombre: socio.nombre, estado: socio.estado };
  }
}
