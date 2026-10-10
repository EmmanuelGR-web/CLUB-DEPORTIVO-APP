// =====================================================================
// gestion.service.ts
// -----------------------------------------------------------------------
// Lo que hace el personal del club desde su panel: revisar solicitudes,
// atender el padrón, responder mensajes de socios, dar altas en la sede
// y hablar con la dirección por el canal interno.
//
// Las solicitudes no se guardan aparte: salen de tres lugares.
//   - Altas online: registro "Alta de socio" pendiente.
//   - Cambios que hizo el socio en su cuenta (registro con autor Socio).
//     Los de documento esperan aprobación; el resto ya se aplicó y, si
//     se rechaza, se vuelve al dato anterior.
//   - Comprobantes de pago informados por el socio.
// =====================================================================

import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SociosService, normalizarDni } from '../socios/socios.service';
import { Socio, MedioPagoSocio } from '../socios/entidades/socio.entity';
import { PerfilesService, CambiosSocio } from '../perfiles/perfiles.service';
import { PagosService } from '../pagos/pagos.service';
import { Pago } from '../pagos/entidades/pago.entity';
import { EstadoPago } from '../pagos/entidades/estado-pago.enum';
import { RegistroCambiosService } from '../registro-cambios/registro-cambios.service';
import { RegistroCambio } from '../registro-cambios/registro-cambio.entity';
import { MensajeNuevo, MensajesService } from '../mensajes/mensajes.service';
import { Hilo } from '../mensajes/mensaje.entity';
import { PersonalService, DIRECCION, ausenciaVigente } from '../personal/personal.service';
import { JornadasService, jornadaParaPanel } from '../personal/jornadas.service';
import { Personal } from '../personal/personal.entity';
import { Rol } from '../../comun/enums/rol.enum';
import { UsuarioAutenticado } from '../../comun/decoradores/usuario-actual.decorator';
import { CORREO_ADMINISTRACION, CORREO_DIRECCION, correoInstitucional } from '../../comun/utilidades/correos.util';

type EstadoSolicitud = 'Pendiente' | 'Autorizado' | 'Rechazado';

const formatoPesos = (monto: number) => monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const enumerar = (lista: string[]) => (lista.length > 1 ? `${lista.slice(0, -1).join(', ')} y ${lista.at(-1)}` : lista[0]);
const soloDigitos = (texto?: string) => (texto ?? '').replace(/\D/g, '');

const EMISORES = ['bna', 'macro', 'mercadopago', 'uala'];

function detalleIdentidad(r: RegistroCambio) {
  const campos = enumerar(r.cambios.map((c) => `su ${c.campo === 'DNI' ? 'DNI' : c.campo.toLowerCase()}`));
  if (r.resuelto === 'Autorizado') return `El socio pidió cambiar ${campos}. El cambio ya se aplicó en su perfil y en su carnet.`;
  if (r.resuelto === 'Rechazado') return `El socio pidió cambiar ${campos}. El pedido se rechazó y sus datos quedaron como estaban.`;
  return `El socio pidió cambiar ${campos}. No se aplica hasta que lo autorices: comparalo con las fotos del DNI.`;
}

const tipoDeCambio = (r: RegistroCambio) =>
  r.pendiente ? 'Cambio de nombre, DNI o nacimiento' : r.seccion === 'Datos personales' ? 'Cambio de contacto o domicilio' : r.seccion;

// Formato del canal interno que usa el panel.
const aInterno = (hilo: Hilo, persona: Personal | undefined) => ({
  id: hilo.id,
  asunto: hilo.asunto,
  empleado: { id: hilo.personalId, nombre: persona?.nombre ?? 'Personal', correo: persona?.correo ?? '' },
  leidoPor: { empleado: hilo.leidoPorSocio, admin: hilo.leidoPorClub },
  mensajes: hilo.mensajes.map((m) => ({ id: m.id, rol: m.delClub ? 'admin' : 'empleado', de: m.de, para: m.para, fecha: m.fecha, texto: m.texto, adjuntos: m.adjuntos })),
});

export interface AltaPresencial {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
  telefono: string;
  email: string;
  foto?: string | null;
  medioPago: Record<string, unknown>;
}

@Injectable()
export class GestionService {
  constructor(
    private readonly socios: SociosService,
    private readonly perfiles: PerfilesService,
    private readonly pagos: PagosService,
    private readonly registro: RegistroCambiosService,
    private readonly mensajes: MensajesService,
    private readonly personal: PersonalService,
    private readonly jornadas: JornadasService,
  ) {}

  // ------------------------------------------------------------------
  // Panel
  // ------------------------------------------------------------------

  async listarPerfiles() {
    const socios = (await this.socios.listar()).filter((s) => s.rol === Rol.SOCIO && s.activo);
    return socios.map((s) => this.perfiles.datosBasicos(s)).sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
  }

  async panel(usuario: UsuarioAutenticado) {
    const persona = usuario.rol === Rol.ADMINISTRATIVO ? await this.personal.deUsuario(usuario.id) : null;
    const [perfiles, solicitudes, conversaciones, registros] = await Promise.all([
      this.listarPerfiles(),
      this.solicitudes(),
      this.conversaciones(),
      this.registro.listarTodos(),
    ]);
    const haceUnaSemana = Date.now() - 7 * 24 * 3600 * 1000;
    return {
      empleado: persona ? this.personal.datosParaPanel(persona) : { ...DIRECCION, id: null },
      perfiles,
      solicitudes,
      conversaciones,
      registros,
      cambiosSemana: registros.filter((r) => r.fecha.getTime() > haceUnaSemana).length,
      hilosInternos: await this.internos(usuario),
      ausencia: persona ? ausenciaVigente(persona) : null,
    };
  }

  // ------------------------------------------------------------------
  // Solicitudes
  // ------------------------------------------------------------------

  async solicitudes() {
    const [registros, pagos, socios] = await Promise.all([this.registro.listarTodos(2000), this.pagos.informadosConComprobante(), this.socios.listar()]);
    const socioPorId = new Map(socios.map((s) => [s.id, s]));
    const archivos = await this.pagos.archivosDe(pagos.map((p) => p.comprobanteId!).filter(Boolean));
    const revision = (estado: string, resueltoPor: string | null, resueltoEn: Date | null, motivo: string | null) =>
      resueltoPor && resueltoEn ? { estado, revisadoPor: resueltoPor, fecha: resueltoEn.toISOString(), motivo: motivo ?? '' } : null;

    const altas = registros
      .filter((r) => r.seccion === 'Alta de socio' && r.socioId && socioPorId.has(r.socioId))
      .map((r) => {
        const s = socioPorId.get(r.socioId!)!;
        const estado: EstadoSolicitud = r.resuelto ?? 'Pendiente';
        return {
          id: `alta-${r.id}`,
          tipo: 'Alta de socio',
          socioId: s.id,
          socioNombre: s.nombreCompleto,
          socioDni: s.dni,
          fecha: r.fecha.toISOString(),
          detalle: `Se registró desde la web con pago en ${s.medioPago?.tipo === 'tarjeta' ? 'tarjeta' : 'efectivo'}.`,
          cambios: [],
          foto: s.foto,
          lecturaIA: s.lecturaIA,
          estado,
          revision: revision(estado, r.resueltoPor, r.resueltoEn, r.motivo),
        };
      });

    const cambios = registros
      .filter((r) => r.autor === 'Socio' && !['Contraseña', 'Alta de socio'].includes(r.seccion) && r.socioId)
      .map((r) => {
        const s = socioPorId.get(r.socioId!);
        const estado: EstadoSolicitud = r.resuelto ?? 'Pendiente';
        return {
          id: `cambio-${r.id}`,
          tipo: tipoDeCambio(r),
          socioId: r.socioId,
          socioNombre: s?.nombreCompleto ?? r.socioNombre,
          socioDni: s?.dni ?? null,
          fecha: r.fecha.toISOString(),
          detalle: r.pendiente ? detalleIdentidad(r) : 'Cambio hecho por el socio desde su panel. Si lo rechazás, la cuenta vuelve a los datos anteriores.',
          cambios: r.cambios,
          pendiente: r.pendiente,
          estado,
          revision: revision(estado, r.resueltoPor, r.resueltoEn, r.motivo),
        };
      });

    // Un mismo número de operación en dos comprobantes distintos es sospechoso.
    const operaciones = pagos.map((p) => ({ id: p.id, numero: soloDigitos(p.verificacionIA?.numeroOperacion) })).filter((o) => o.numero);
    const repetida = (pago: Pago) => {
      const numero = soloDigitos(pago.verificacionIA?.numeroOperacion);
      return Boolean(numero) && operaciones.some((o) => o.numero === numero && o.id !== pago.id);
    };

    const comprobantes = pagos
      .filter((p) => socioPorId.has(p.socioId))
      .map((p) => {
        const s = socioPorId.get(p.socioId)!;
        const [anio, mes] = p.periodo.split('-');
        const estado: EstadoSolicitud = p.estado === EstadoPago.APROBADO ? 'Autorizado' : p.estado === EstadoPago.RECHAZADO ? 'Rechazado' : 'Pendiente';
        const demora = p.diasDemora;
        return {
          id: `pago-${p.id}`,
          tipo: 'Comprobante de pago',
          socioId: s.id,
          socioNombre: s.nombreCompleto,
          socioDni: s.dni,
          fecha: p.informadoEn.toISOString(),
          detalle: `Informó el pago de la cuota ${mes}/${anio} por ${formatoPesos(Number(p.monto))}, pagado el ${p.fechaPago.toLocaleDateString('es-AR')} (${p.medioPago.toLowerCase()}).${
            demora > 0 ? ` Pagó con ${demora} ${demora === 1 ? 'día' : 'días'} de demora: el monto incluye el recargo.` : ' Pagó en término.'
          } Verificá que el comprobante coincida con la fecha y el monto.`,
          cambios: [],
          comprobante: archivos.get(p.comprobanteId!) ?? null,
          verificacionIA: p.verificacionIA,
          operacionRepetida: repetida(p),
          periodo: p.periodo,
          estado,
          revision: revision(estado, p.resueltoPor, p.resueltoEn, p.observacion),
        };
      });

    return [...altas, ...cambios, ...comprobantes].sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  private async avisarAlSocio(socio: Socio, tipo: string, estado: 'Autorizado' | 'Rechazado', motivo: string, extra: { pendiente?: boolean; revertidos?: string[] } = {}) {
    const texto =
      estado === 'Autorizado'
        ? `Tu solicitud "${tipo}" fue autorizada.${tipo === 'Alta de socio' ? ' Tu carnet digital ya está activo. Ya sos parte del club.' : ''}${
            extra.pendiente ? ' Tus datos ya se actualizaron en tu perfil y en tu carnet.' : ''
          }`
        : `Tu solicitud "${tipo}" fue rechazada.${motivo ? ` Motivo: ${motivo}` : ''}${
            extra.revertidos?.length ? ` Restablecimos los datos anteriores de: ${extra.revertidos.join(', ').toLowerCase()}.` : ''
          } Si tenés dudas, respondé este mensaje.`;
    await this.mensajes.crearHilo(
      { socioId: socio.id },
      'socio',
      { autorId: null, delClub: true, de: CORREO_ADMINISTRACION, para: correoInstitucional(socio.nombreCompleto, String(socio.idSocio)) },
      { asunto: `${tipo}: ${estado.toLowerCase()}`, texto },
    );
  }

  async resolverSolicitud(usuario: UsuarioAutenticado, id: string, estado: 'Autorizado' | 'Rechazado', motivo = '') {
    if (estado === 'Rechazado' && motivo.trim().length < 5) throw new BadRequestException('Contá brevemente por qué se rechaza.');
    const firma = await this.personal.firma(usuario);
    const autorizado = estado === 'Autorizado';
    const [origen, ...resto] = id.split('-');
    const idReal = resto.join('-');
    let socio: Socio;
    let tipo: string;
    let extra: { pendiente?: boolean; revertidos?: string[] } = {};

    if (origen === 'pago') {
      const pago = await this.pagos.buscarPago(idReal);
      socio = await this.socios.buscarPorId(pago.socioId);
      tipo = 'Comprobante de pago';
      await this.pagos.resolver(pago, autorizado, motivo.trim(), firma);
    } else if (origen === 'alta' || origen === 'cambio') {
      const registro = await this.registro.buscar(idReal);
      if (registro.resuelto) throw new ConflictException('Esa solicitud ya fue revisada.');
      socio = await this.socios.buscarPorId(registro.socioId!);
      if (origen === 'alta') {
        tipo = 'Alta de socio';
        socio.estado = autorizado ? 'Activo' : 'Rechazado';
        await this.socios.guardar(socio);
      } else {
        tipo = tipoDeCambio(registro);
        if (registro.pendiente) {
          extra = { pendiente: true };
          if (autorizado && registro.valores) socio = await this.perfiles.aplicarAprobados(socio.id, registro.valores);
        } else if (!autorizado && registro.valores) {
          extra = { revertidos: await this.perfiles.revertir(socio.id, registro.valores, firma) };
        }
      }
      await this.registro.marcarResuelto(registro, estado, motivo.trim(), firma);
    } else {
      throw new BadRequestException('Solicitud desconocida.');
    }

    await this.avisarAlSocio(socio, tipo, estado, motivo.trim(), extra);
    await this.registro.registrar({
      socioId: socio.id,
      socioNombre: socio.nombreCompleto,
      seccion: `Solicitud: ${tipo}`,
      autor: firma,
      cambios: [{ campo: 'Estado', anterior: 'Pendiente', nuevo: motivo.trim() ? `${estado} (${motivo.trim()})` : estado }],
    });
    return (await this.solicitudes()).find((s) => s.id === id) ?? null;
  }

  // ------------------------------------------------------------------
  // Padrón y ficha del socio
  // ------------------------------------------------------------------

  async ficha(socioId: string) {
    const socio = await this.socios.buscarPorId(socioId);
    if (socio.rol !== Rol.SOCIO || !socio.activo) throw new BadRequestException('Este socio ya no está en el padrón.');
    const [perfil, historial] = await Promise.all([this.perfiles.armar(socioId), this.registro.listarDeSocio(socioId)]);
    return { perfil, historial };
  }

  async corregir(usuario: UsuarioAutenticado, socioId: string, cambios: CambiosSocio, seccion: string) {
    const firma = await this.personal.firma(usuario);
    const resultado = await this.perfiles.guardarCambios(socioId, cambios, seccion, { nombre: firma, esSocio: false });
    return { resultado, ...(await this.ficha(socioId)) };
  }

  async restablecerContrasena(usuario: UsuarioAutenticado, socioId: string) {
    const firma = await this.personal.firma(usuario);
    const socio = await this.socios.buscarPorIdConContrasena(socioId);
    if (!socio.dni) throw new BadRequestException('El socio no tiene DNI cargado: corregilo antes de restablecer la contraseña.');
    socio.contrasenaHash = await bcrypt.hash(normalizarDni(socio.dni), 10);
    socio.debeCambiarContrasena = true;
    await this.socios.guardar(socio);
    await this.registro.registrar({
      socioId,
      socioNombre: socio.nombreCompleto,
      seccion: 'Contraseña',
      autor: firma,
      cambios: [{ campo: 'Contraseña', anterior: '••••••', nuevo: 'Restablecida al DNI' }],
    });
    return { dni: normalizarDni(socio.dni), ...(await this.ficha(socioId)) };
  }

  // Solo la administración principal puede dar de baja: el socio deja
  // de figurar en el padrón, pero sus pagos quedan como historial.
  async darDeBaja(usuario: UsuarioAutenticado, socioId: string) {
    if (usuario.rol !== Rol.ADMIN_PRINCIPAL) throw new ForbiddenException('Solo la administración principal puede dar de baja socios.');
    const firma = await this.personal.firma(usuario);
    const socio = await this.socios.buscarPorId(socioId);
    const estadoAnterior = socio.estado;
    socio.activo = false;
    await this.socios.guardar(socio);
    await this.registro.registrar({
      socioId,
      socioNombre: socio.nombreCompleto,
      seccion: 'Baja de socio',
      autor: firma,
      cambios: [{ campo: 'Estado', anterior: estadoAnterior, nuevo: 'Dado de baja' }],
    });
    return { ok: true };
  }

  async altaPresencial(usuario: UsuarioAutenticado, datos: AltaPresencial) {
    const firma = await this.personal.firma(usuario);
    const dni = normalizarDni(datos.dni);
    const medio = datos.medioPago;
    const medioPago: MedioPagoSocio =
      medio?.tipo === 'tarjeta' && EMISORES.includes(String(medio.emisor)) && /^\d{4}$/.test(String(medio.ultimos4))
        ? {
            tipo: 'tarjeta',
            debitoAutomatico: Boolean(medio.debitoAutomatico),
            emisor: String(medio.emisor),
            red: ['visa', 'mastercard', 'amex'].includes(String(medio.red)) ? String(medio.red) : null,
            ultimos4: String(medio.ultimos4),
          }
        : { tipo: 'efectivo', debitoAutomatico: false };

    const socio = await this.socios.crear({
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      contrasenaHash: await bcrypt.hash(dni, 10),
      dni,
      fechaNacimiento: datos.fechaNacimiento,
      direccion: datos.direccion,
      telefono: datos.telefono,
      foto: datos.foto ?? null,
      medioPago,
      estado: 'Activo',
      debeCambiarContrasena: true,
    });
    await this.registro.registrar({
      socioId: socio.id,
      socioNombre: socio.nombreCompleto,
      seccion: 'Alta presencial',
      autor: firma,
      cambios: [{ campo: 'Estado', anterior: 'Sin cuenta', nuevo: 'Activo' }],
    });
    await this.mensajes.crearHilo(
      { socioId: socio.id },
      'socio',
      { autorId: null, delClub: true, de: CORREO_ADMINISTRACION, para: correoInstitucional(socio.nombreCompleto, String(socio.idSocio)) },
      { asunto: 'Bienvenida al club', texto: `Hola, ${socio.nombre}. Ya sos parte del club: tu carnet digital está en el panel de socio. Te recomendamos cambiar la contraseña inicial.` },
    );
    return { nombre: socio.nombreCompleto, email: socio.email, contrasena: dni };
  }

  // ------------------------------------------------------------------
  // Mensajes de socios
  // ------------------------------------------------------------------

  async conversaciones() {
    const [hilos, socios] = await Promise.all([this.mensajes.hilosDeSocios(), this.socios.listar()]);
    const socioPorId = new Map(socios.map((s) => [s.id, s]));
    return hilos
      .filter((h) => h.socioId && socioPorId.has(h.socioId) && h.mensajes.some((m) => !m.delClub))
      .map((h) => {
        const s = socioPorId.get(h.socioId!)!;
        const ultimo = h.mensajes.at(-1)!;
        return {
          socio: { id: s.id, nombre: s.nombreCompleto, correoInstitucional: correoInstitucional(s.nombreCompleto, String(s.idSocio)) },
          hilo: {
            id: h.id,
            asunto: h.asunto,
            mensajes: h.mensajes.map((m) => ({ id: m.id, de: m.de, para: m.para, fecha: m.fecha, texto: m.texto, adjuntos: m.adjuntos, delClub: m.delClub })),
          },
          ultimo: { fecha: ultimo.fecha, texto: ultimo.texto },
          sinResponder: !ultimo.delClub,
        };
      })
      .sort((a, b) => new Date(b.ultimo.fecha).getTime() - new Date(a.ultimo.fecha).getTime());
  }

  async responderSocio(usuario: UsuarioAutenticado, hiloId: string, mensaje: MensajeNuevo) {
    const hilo = await this.mensajes.buscarHilo(hiloId, { tipo: 'socio' });
    const socio = await this.socios.buscarPorId(hilo.socioId!);
    await this.mensajes.responder(
      hilo,
      { autorId: usuario.id, delClub: true, de: CORREO_ADMINISTRACION, para: correoInstitucional(socio.nombreCompleto, String(socio.idSocio)) },
      mensaje,
    );
    return this.conversaciones();
  }

  // ------------------------------------------------------------------
  // Canal interno con la dirección
  // ------------------------------------------------------------------

  async internos(usuario: UsuarioAutenticado) {
    const nomina = await this.personal.listar();
    const porId = new Map(nomina.map((p) => [p.id, p]));
    if (usuario.rol === Rol.ADMIN_PRINCIPAL) return (await this.mensajes.hilosInternos()).map((h) => aInterno(h, porId.get(h.personalId!)));
    const persona = nomina.find((p) => p.usuarioId === usuario.id);
    if (!persona) return [];
    return (await this.mensajes.hilosInternos(persona.id)).map((h) => aInterno(h, persona));
  }

  private async hiloInternoPermitido(usuario: UsuarioAutenticado, hiloId: string) {
    const hilo = await this.mensajes.buscarHilo(hiloId, { tipo: 'interno' });
    if (usuario.rol !== Rol.ADMIN_PRINCIPAL) {
      const persona = await this.personal.deUsuario(usuario.id);
      if (!persona || hilo.personalId !== persona.id) throw new ForbiddenException('Esa conversación no es tuya.');
    }
    return hilo;
  }

  async nuevoInterno(usuario: UsuarioAutenticado, mensaje: MensajeNuevo, destino?: string) {
    const nomina = await this.personal.listar();
    let destinatarios: Personal[];
    if (usuario.rol === Rol.ADMIN_PRINCIPAL) {
      if (!destino) throw new BadRequestException('Elegí a quién le mandás el mensaje.');
      destinatarios = destino === 'todos' ? nomina.filter((p) => !ausenciaVigente(p)) : nomina.filter((p) => p.id === destino);
      if (destinatarios.length === 0) throw new BadRequestException('No hay nadie del personal para recibir el mensaje.');
    } else {
      const persona = nomina.find((p) => p.usuarioId === usuario.id);
      if (!persona) throw new ForbiddenException('Tu usuario no está vinculado al personal.');
      destinatarios = [persona];
    }
    const delClub = usuario.rol === Rol.ADMIN_PRINCIPAL;
    let primero: string | null = null;
    for (const persona of destinatarios) {
      const hilo = await this.mensajes.crearHilo(
        { personalId: persona.id },
        'interno',
        { autorId: usuario.id, delClub, de: delClub ? CORREO_DIRECCION : persona.correo, para: delClub ? persona.correo : CORREO_DIRECCION },
        mensaje,
      );
      primero ??= hilo.id;
    }
    return { id: primero, hilos: await this.internos(usuario) };
  }

  async responderInterno(usuario: UsuarioAutenticado, hiloId: string, mensaje: MensajeNuevo) {
    const hilo = await this.hiloInternoPermitido(usuario, hiloId);
    const persona = (await this.personal.listar()).find((p) => p.id === hilo.personalId);
    const delClub = usuario.rol === Rol.ADMIN_PRINCIPAL;
    await this.mensajes.responder(
      hilo,
      { autorId: usuario.id, delClub, de: delClub ? CORREO_DIRECCION : (persona?.correo ?? ''), para: delClub ? (persona?.correo ?? '') : CORREO_DIRECCION },
      mensaje,
    );
    return this.internos(usuario);
  }

  async leidoInterno(usuario: UsuarioAutenticado, hiloId: string) {
    const hilo = await this.hiloInternoPermitido(usuario, hiloId);
    await this.mensajes.marcarLeido(hilo, usuario.rol === Rol.ADMIN_PRINCIPAL ? 'club' : 'socio');
  }

  // ------------------------------------------------------------------
  // Jornada del empleado
  // ------------------------------------------------------------------

  private async personaDe(usuario: UsuarioAutenticado) {
    const persona = await this.personal.deUsuario(usuario.id);
    if (!persona) throw new ForbiddenException('Tu usuario no está vinculado al personal.');
    return persona;
  }

  async jornada(usuario: UsuarioAutenticado, accion: 'actividad' | 'descanso' | 'volver' | 'salida' | 'fin') {
    const persona = await this.personaDe(usuario);
    const j =
      accion === 'actividad'
        ? await this.jornadas.marcarActividad(persona.id)
        : accion === 'descanso'
          ? await this.jornadas.iniciarDescanso(persona.id)
          : accion === 'volver'
            ? await this.jornadas.terminarDescanso(persona.id)
            : await this.jornadas.registrarSalida(persona.id, accion === 'fin');
    return jornadaParaPanel(j);
  }
}
