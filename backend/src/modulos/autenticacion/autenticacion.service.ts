import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { cifrarContrasena, compararContrasena } from '../../comun/utilidades/contrasenas.util';
import { CargaUtilJwt, DURACION_COMUN, DURACION_RECORDADA } from './sesion';
import { SociosService } from '../socios/socios.service';
import { Socio, MedioPagoSocio } from '../socios/entidades/socio.entity';
import { RegistrarSocioDto } from '../socios/dto/registrar-socio.dto';
import { RegistroCambiosService } from '../registro-cambios/registro-cambios.service';
import { MensajesService } from '../mensajes/mensajes.service';
import { Rol } from '../../comun/enums/rol.enum';
import { PersonalService, ausenciaVigente, textoAusencia } from '../personal/personal.service';
import { CORREO_ADMINISTRACION, correoInstitucional } from '../../comun/utilidades/correos.util';

const PANEL_POR_ROL: Record<Rol, { ruta: string; rolTexto: string }> = {
  [Rol.SOCIO]: { ruta: '/socio', rolTexto: 'Socio' },
  [Rol.ADMINISTRATIVO]: { ruta: '/empleado', rolTexto: 'Personal administrativo' },
  [Rol.ADMIN_PRINCIPAL]: { ruta: '/admin', rolTexto: 'Administración principal' },
};

const EMISORES = ['bna', 'macro', 'mercadopago', 'uala'];

const MAXIMO_INTENTOS = 5;
const MINUTOS_BLOQUEO = 15;

const mensajeBloqueo = (hasta: Date) => {
  const minutos = Math.max(1, Math.ceil((hasta.getTime() - Date.now()) / 60_000));
  return `Por seguridad bloqueamos la cuenta después de varios intentos fallidos. Probá de nuevo en ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'} o pedí ayuda en la secretaría del club.`;
};

const HASH_DE_RELLENO = '$2b$12$QMVeglyOze.eGiSjzCmhqeH4XGB7VETy8ICYQO3kcWVMeZ8MQx58.';

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
    private readonly personal: PersonalService,
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

  private readonly registroSeguridad = new Logger('Seguridad');

  emitirPase(socio: Pick<Socio, 'id' | 'email' | 'rol' | 'versionSesion'>, recordar: boolean) {
    const carga: CargaUtilJwt = { sub: socio.id, email: socio.email, rol: socio.rol, ver: socio.versionSesion ?? 0, rec: recordar };
    return this.jwtService.sign(carga, { expiresIn: recordar ? DURACION_RECORDADA : DURACION_COMUN });
  }

  async sesionActual(id: string) {
    return this.usuarioDeSesion(await this.sociosService.buscarPorId(id));
  }

  async iniciarSesion(email: string, contrasena: string, recordar = false) {
    const socio = await this.sociosService.buscarPorEmailConContrasena(email);
    if (socio?.bloqueadoHasta && socio.bloqueadoHasta > new Date()) {
      throw new HttpException(mensajeBloqueo(socio.bloqueadoHasta), HttpStatus.TOO_MANY_REQUESTS);
    }
    const correcta = await compararContrasena(contrasena, socio?.contrasenaHash ?? HASH_DE_RELLENO);
    if (!socio || !correcta) {
      if (socio) {
        const bloqueada = await this.sociosService.registrarIntentoFallido(socio, MAXIMO_INTENTOS, MINUTOS_BLOQUEO);
        if (bloqueada) {
          this.registroSeguridad.warn(`Cuenta ${socio.id} bloqueada ${MINUTOS_BLOQUEO} min por ${MAXIMO_INTENTOS} intentos fallidos`);
          throw new HttpException(mensajeBloqueo(new Date(Date.now() + MINUTOS_BLOQUEO * 60_000)), HttpStatus.TOO_MANY_REQUESTS);
        }
      }
      throw new UnauthorizedException('Revisá el correo y la contraseña e intentá de nuevo.');
    }
    if (socio.intentosFallidos || socio.bloqueadoHasta) await this.sociosService.limpiarIntentos(socio.id);
    if (!socio.activo) throw new UnauthorizedException('La cuenta está dada de baja. Comunicate con la secretaría del club.');
    if (socio.rol === Rol.ADMINISTRATIVO) {
      const persona = await this.personal.deUsuario(socio.id);
      const ausencia = persona && ausenciaVigente(persona);
      if (ausencia) throw new ForbiddenException({ message: textoAusencia(ausencia), bloqueo: ausencia });
    }

    return { token: this.emitirPase(socio, recordar), usuario: this.usuarioDeSesion(socio) };
  }

  async registrarSocio(datos: RegistrarSocioDto) {
    const contrasenaHash = await cifrarContrasena(datos.contrasena);
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
          privacidadAceptada: new Date(),
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
        { socioId: nuevo.id },
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
