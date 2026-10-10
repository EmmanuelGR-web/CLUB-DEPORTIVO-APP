import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PerfilesService, CambiosSocio } from '../perfiles/perfiles.service';
import { SociosService } from '../socios/socios.service';
import { PagosService } from '../pagos/pagos.service';
import { RegistroCambiosService } from '../registro-cambios/registro-cambios.service';
import { MensajeNuevo, MensajesService } from '../mensajes/mensajes.service';
import { Hilo } from '../mensajes/mensaje.entity';
import { InformarPagoDto } from './dto/mi-cuenta.dto';
import { VerificacionIA } from '../pagos/entidades/pago.entity';
import { CORREO_ADMINISTRACION, correoInstitucional } from '../../comun/utilidades/correos.util';

const AUTOR_SOCIO = { nombre: 'Socio', esSocio: true };

// La bandeja como la muestra el panel: cada mensaje dice si es del club.
const aBandeja = (hilo: Hilo) => ({
  id: hilo.id,
  asunto: hilo.asunto,
  leido: hilo.leidoPorSocio,
  mensajes: hilo.mensajes.map((m) => ({ id: m.id, de: m.de, para: m.para, fecha: m.fecha, texto: m.texto, adjuntos: m.adjuntos, delClub: m.delClub })),
});

@Injectable()
export class MiCuentaService {
  constructor(
    private readonly perfiles: PerfilesService,
    private readonly socios: SociosService,
    private readonly pagos: PagosService,
    private readonly registro: RegistroCambiosService,
    private readonly mensajes: MensajesService,
  ) {}

  perfil(socioId: string) {
    return this.perfiles.armar(socioId);
  }

  async guardarCambios(socioId: string, cambios: CambiosSocio, seccion: string) {
    const resultado = await this.perfiles.guardarCambios(socioId, cambios, seccion, AUTOR_SOCIO);
    return { resultado, perfil: await this.perfiles.armar(socioId) };
  }

  historial(socioId: string) {
    return this.registro.listarDeSocio(socioId);
  }

  async cambiarContrasena(socioId: string, actual: string, nueva: string) {
    const socio = await this.socios.buscarPorIdConContrasena(socioId);
    if (!(await bcrypt.compare(actual, socio.contrasenaHash))) {
      throw new BadRequestException({ message: 'La contraseña actual no es correcta.', campo: 'actual' });
    }
    if (actual === nueva) throw new BadRequestException('La contraseña nueva tiene que ser distinta de la actual.');
    socio.contrasenaHash = await bcrypt.hash(nueva, 10);
    socio.debeCambiarContrasena = false;
    await this.socios.guardar(socio);
    await this.registro.registrar({
      socioId,
      socioNombre: socio.nombreCompleto,
      seccion: 'Contraseña',
      cambios: [{ campo: 'Contraseña', anterior: '••••••', nuevo: 'Cambiada por el socio' }],
    });
    return { ok: true };
  }

  async informarPago(socioId: string, datos: InformarPagoDto) {
    const socio = await this.socios.buscarPorId(socioId);
    await this.pagos.informar(socio, { ...datos, verificacionIA: datos.verificacionIA as unknown as VerificacionIA | undefined });
    return this.perfiles.armar(socioId);
  }

  async hilos(socioId: string) {
    return (await this.mensajes.hilosDe(socioId)).map(aBandeja);
  }

  private async remitente(socioId: string) {
    const socio = await this.socios.buscarPorId(socioId);
    return {
      autorId: socio.id,
      delClub: false,
      de: correoInstitucional(socio.nombreCompleto, String(socio.idSocio)),
      para: CORREO_ADMINISTRACION,
    };
  }

  async nuevoHilo(socioId: string, mensaje: MensajeNuevo) {
    const hilo = await this.mensajes.crearHilo({ socioId }, 'socio', await this.remitente(socioId), mensaje);
    return { id: hilo.id, hilos: await this.hilos(socioId) };
  }

  async responder(socioId: string, hiloId: string, mensaje: MensajeNuevo) {
    const hilo = await this.mensajes.buscarHilo(hiloId, { socioId, tipo: 'socio' });
    await this.mensajes.responder(hilo, await this.remitente(socioId), mensaje);
    return this.hilos(socioId);
  }

  async marcarLeido(socioId: string, hiloId: string) {
    await this.mensajes.marcarLeido(await this.mensajes.buscarHilo(hiloId, { socioId, tipo: 'socio' }), 'socio');
  }
}
