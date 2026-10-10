// =====================================================================
// perfiles.service.ts
// -----------------------------------------------------------------------
// Arma el "perfil" completo de un socio tal como lo usan los paneles
// (datos, categoría, antigüedad, correo institucional y estado de
// cuenta) y aplica los cambios en su cuenta dejando constancia.
//
// Reglas de los cambios:
//   - Contacto, domicilio, medio de pago y foto se aplican al instante.
//   - Si el socio cambia su nombre, DNI o fecha de nacimiento, el
//     cambio queda pendiente hasta que el personal lo apruebe.
//   - Si los cambia el personal, se aplican al instante.
//   - La foto del carnet se puede cambiar una vez cada 6 meses.
// =====================================================================

import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Socio, MedioPagoSocio } from '../socios/entidades/socio.entity';
import { normalizarDni, normalizarEmail, SociosService } from '../socios/socios.service';
import { PagosService } from '../pagos/pagos.service';
import { RegistroCambiosService } from '../registro-cambios/registro-cambios.service';
import { CambioVisible, ValoresCambio } from '../registro-cambios/registro-cambio.entity';
import { aniosEntre, categoriaPorAntiguedad } from '../../comun/utilidades/cuotas.util';
import { correoInstitucional } from '../../comun/utilidades/correos.util';

export const CAMPOS_IDENTIDAD = ['nombre', 'apellido', 'dni', 'fechaNacimiento'] as const;
const CAMPOS_EDITABLES = [...CAMPOS_IDENTIDAD, 'direccion', 'telefono', 'email', 'medioPago', 'foto'] as const;
export type CampoEditable = (typeof CAMPOS_EDITABLES)[number];
export type CambiosSocio = Partial<Record<CampoEditable, unknown>>;

export const MESES_ENTRE_CAMBIOS_DE_FOTO = 6;

const NOMBRES_CAMPO: Record<CampoEditable, string> = {
  nombre: 'Nombre',
  apellido: 'Apellido',
  dni: 'DNI',
  fechaNacimiento: 'Fecha de nacimiento',
  direccion: 'Dirección',
  telefono: 'Teléfono',
  email: 'Correo electrónico',
  medioPago: 'Medio de pago',
  foto: 'Foto de perfil',
};

const EMISORES = ['bna', 'macro', 'mercadopago', 'uala'];
const REDES = ['visa', 'mastercard', 'amex'];

const edadValida = (fecha: string) => {
  const anios = (Date.now() - new Date(`${fecha}T12:00:00`).getTime()) / (365.25 * 24 * 3600 * 1000);
  return anios >= 0 && anios < 110;
};

// Mismas validaciones que los formularios del portal.
const VALIDACIONES: Record<Exclude<CampoEditable, 'medioPago' | 'foto'>, [(v: string) => boolean, string]> = {
  nombre: [(v) => v.trim().length >= 2, 'Ingresá tu nombre.'],
  apellido: [(v) => v.trim().length >= 2, 'Ingresá tu apellido.'],
  dni: [(v) => /^\d{7,8}$/.test(normalizarDni(v)), 'El DNI tiene 7 u 8 números.'],
  fechaNacimiento: [(v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && edadValida(v), 'Ingresá una fecha de nacimiento válida.'],
  direccion: [(v) => v.trim().length >= 5, 'Ingresá tu dirección.'],
  telefono: [(v) => v.replace(/\D/g, '').length >= 8, 'Ingresá un teléfono válido.'],
  email: [(v) => /^\S+@\S+\.\S+$/.test(v), 'Ingresá un correo electrónico válido.'],
};

const textoMedio = (medio: MedioPagoSocio) => (medio.tipo === 'tarjeta' ? 'Tarjeta' : 'Efectivo');

function describir(campo: CampoEditable, valor: unknown): string {
  if (campo === 'foto') return valor ? 'Foto cargada' : 'Sin foto';
  if (campo === 'medioPago') {
    const medio = valor as MedioPagoSocio;
    const tarjeta = medio.ultimos4 ? ` terminada en ${medio.ultimos4}` : '';
    return `${textoMedio(medio)}${tarjeta} · débito automático ${medio.debitoAutomatico ? 'sí' : 'no'}`;
  }
  return valor ? String(valor) : '—';
}

export interface Autor {
  nombre: string; // 'Socio' cuando el cambio lo hace el propio socio
  esSocio: boolean;
}

@Injectable()
export class PerfilesService {
  constructor(
    private readonly socios: SociosService,
    private readonly pagos: PagosService,
    private readonly registro: RegistroCambiosService,
  ) {}

  proximoCambioDeFoto(socio: Socio, hoy = new Date()) {
    if (!socio.foto || !socio.fotoActualizada) return null;
    const habilitada = new Date(socio.fotoActualizada);
    habilitada.setMonth(habilitada.getMonth() + MESES_ENTRE_CAMBIOS_DE_FOTO);
    return habilitada > hoy ? habilitada : null;
  }

  datosBasicos(socio: Socio, hoy = new Date()) {
    const alta = socio.fechaAltaComoFecha;
    const anios = aniosEntre(alta, hoy);
    const numeroSocio = String(socio.idSocio);
    return {
      id: socio.id,
      numeroSocio,
      nombre: socio.nombre,
      apellido: socio.apellido,
      nombreCompleto: socio.nombreCompleto,
      email: socio.email,
      dni: socio.dni ?? '',
      fechaNacimiento: socio.fechaNacimiento ? String(socio.fechaNacimiento).slice(0, 10) : '',
      direccion: socio.direccion ?? '',
      telefono: socio.telefono ?? '',
      foto: socio.foto,
      fotoActualizada: socio.fotoActualizada?.toISOString() ?? null,
      fechaAlta: alta.toISOString(),
      anioIngreso: alta.getFullYear(),
      antiguedadAnios: anios,
      categoria: categoriaPorAntiguedad(anios),
      estado: socio.estado,
      correoInstitucional: correoInstitucional(socio.nombreCompleto, numeroSocio),
      medioPago: socio.medioPago,
      debeCambiarContrasena: socio.debeCambiarContrasena,
      rol: socio.rol,
    };
  }

  async armar(socioId: string, hoy = new Date()) {
    const socio = await this.socios.buscarPorId(socioId);
    const [pagos, identidadPendiente] = await Promise.all([
      this.pagos.estadoDeCuenta(socio, hoy),
      this.registro.identidadPendiente(socio.id),
    ]);
    return {
      ...this.datosBasicos(socio, hoy),
      proximoCambioDeFoto: this.proximoCambioDeFoto(socio, hoy)?.toISOString() ?? null,
      pagos,
      identidadPendiente,
    };
  }

  // Perfiles completos de varios socios de una vez, sin el detalle de
  // pedidos pendientes (lo usa la administración para la facturación).
  async armarVarios(socios: Socio[], hoy = new Date()) {
    const estados = await this.pagos.estadosDeCuenta(socios, hoy);
    return socios.map((s) => ({ ...this.datosBasicos(s, hoy), pagos: estados.get(s.id) ?? [] }));
  }

  // Valor actual de un campo, en el mismo formato que llega del formulario.
  private valorActual(socio: Socio, campo: CampoEditable): unknown {
    if (campo === 'fechaNacimiento') return socio.fechaNacimiento ? String(socio.fechaNacimiento).slice(0, 10) : '';
    if (campo === 'medioPago') return socio.medioPago;
    if (campo === 'foto') return socio.foto;
    return socio[campo] ?? '';
  }

  private limpiar(campo: CampoEditable, valor: unknown): unknown {
    if (campo === 'medioPago') {
      const medio = valor as Partial<MedioPagoSocio>;
      if (medio?.tipo === 'efectivo') return { tipo: 'efectivo', debitoAutomatico: false };
      if (medio?.tipo !== 'tarjeta' || !EMISORES.includes(String(medio.emisor)) || !/^\d{4}$/.test(String(medio.ultimos4))) {
        throw new BadRequestException('Revisá los datos de la tarjeta.');
      }
      return {
        tipo: 'tarjeta',
        debitoAutomatico: Boolean(medio.debitoAutomatico),
        emisor: medio.emisor,
        red: REDES.includes(String(medio.red)) ? medio.red : null,
        ultimos4: medio.ultimos4,
      };
    }
    if (campo === 'foto') {
      if (typeof valor !== 'string' || !/^data:image\/(jpeg|png|webp);base64,/.test(valor) || valor.length > 200_000) {
        throw new BadRequestException('La foto no es válida.');
      }
      return valor;
    }
    const texto = String(valor ?? '');
    const [valido, mensaje] = VALIDACIONES[campo];
    if (!valido(texto)) throw new BadRequestException(mensaje);
    if (campo === 'dni') return normalizarDni(texto);
    if (campo === 'email') return normalizarEmail(texto);
    return texto.trim();
  }

  private aplicar(socio: Socio, campo: CampoEditable, valor: unknown) {
    if (campo === 'foto') {
      socio.foto = valor as string;
      socio.fotoActualizada = new Date();
    } else if (campo === 'medioPago') {
      socio.medioPago = valor as MedioPagoSocio;
    } else {
      (socio as unknown as Record<string, unknown>)[campo] = valor;
    }
  }

  // Aplica un cambio de documento que el personal autorizó.
  async aplicarAprobados(socioId: string, valores: ValoresCambio) {
    const socio = await this.socios.buscarPorId(socioId);
    Object.entries(valores).forEach(([campo, v]) => this.aplicar(socio, campo as CampoEditable, v.nuevo));
    return this.socios.guardar(socio);
  }

  // Vuelve a los datos anteriores cuando el personal rechaza un cambio
  // que el socio ya había aplicado. Solo toca los campos que siguen
  // con el valor pedido (si después se volvieron a cambiar, se dejan).
  async revertir(socioId: string, valores: ValoresCambio, autor: string) {
    const socio = await this.socios.buscarPorId(socioId);
    const aRevertir = Object.entries(valores)
      .map(([campo, v]) => [campo as CampoEditable, v] as const)
      .filter(([campo]) => (CAMPOS_EDITABLES as readonly string[]).includes(campo))
      .filter(([campo, v]) => JSON.stringify(this.valorActual(socio, campo) ?? null) === JSON.stringify(v.nuevo))
      .filter(([, v]) => JSON.stringify(v.anterior) !== JSON.stringify(v.nuevo));
    if (aRevertir.length === 0) return [];

    const cambios = aRevertir.map(([campo, v]) => ({ campo: NOMBRES_CAMPO[campo], anterior: describir(campo, v.nuevo), nuevo: describir(campo, v.anterior) }));
    aRevertir.forEach(([campo, v]) => {
      if (campo === 'foto') {
        socio.foto = (v.anterior as string | null) ?? null;
      } else this.aplicar(socio, campo, v.anterior);
    });
    await this.socios.guardar(socio);
    await this.registro.registrar({ socioId, socioNombre: socio.nombreCompleto, seccion: 'Cambio revertido', autor, cambios });
    return cambios.map((c) => c.campo);
  }

  // Devuelve 'pendiente' si quedó algo esperando aprobación, true si se
  // aplicó algún cambio o false si no había nada distinto.
  async guardarCambios(socioId: string, pedidos: CambiosSocio, seccion: string, autor: Autor): Promise<'pendiente' | boolean> {
    const socio = await this.socios.buscarPorId(socioId);
    const distintos = Object.entries(pedidos)
      .filter(([campo]) => (CAMPOS_EDITABLES as readonly string[]).includes(campo))
      .map(([campo, valor]) => [campo as CampoEditable, this.limpiar(campo as CampoEditable, valor)] as const)
      .filter(([campo, nuevo]) => JSON.stringify(this.valorActual(socio, campo) ?? null) !== JSON.stringify(nuevo));
    if (distintos.length === 0) return false;

    const esIdentidad = (campo: CampoEditable) => autor.esSocio && (CAMPOS_IDENTIDAD as readonly string[]).includes(campo);
    const inmediatos = distintos.filter(([campo]) => !esIdentidad(campo));
    const aAprobar = distintos.filter(([campo]) => esIdentidad(campo));

    if (aAprobar.length > 0 && (await this.registro.identidadPendiente(socio.id))) {
      throw new ConflictException('Ya hay un pedido de cambio de documento esperando aprobación.');
    }
    if (inmediatos.some(([campo]) => campo === 'foto') && autor.esSocio && this.proximoCambioDeFoto(socio)) {
      throw new BadRequestException(`La foto del carnet se puede cambiar una vez cada ${MESES_ENTRE_CAMBIOS_DE_FOTO} meses.`);
    }
    const email = distintos.find(([campo]) => campo === 'email')?.[1] as string | undefined;
    const dni = distintos.find(([campo]) => campo === 'dni')?.[1] as string | undefined;
    const duplicado = await this.socios.buscarDuplicado({ email, dni }, socio.id);
    if (duplicado) {
      throw new ConflictException({ message: `Ya hay otro socio con ese ${duplicado === 'email' ? 'correo' : 'DNI'}.`, duplicado });
    }

    const visibles = (lista: typeof distintos): CambioVisible[] =>
      lista.map(([campo, nuevo]) => ({ campo: NOMBRES_CAMPO[campo], anterior: describir(campo, this.valorActual(socio, campo)), nuevo: describir(campo, nuevo) }));
    const valores = (lista: typeof distintos): ValoresCambio =>
      Object.fromEntries(lista.map(([campo, nuevo]) => [campo, { anterior: this.valorActual(socio, campo) ?? null, nuevo }]));
    const nombreAntes = socio.nombreCompleto;

    // Primero se arma la constancia con los valores anteriores; recién
    // después se modifican los datos.
    const registros = [];
    if (inmediatos.length > 0) {
      const documento = inmediatos.filter(([campo]) => (CAMPOS_IDENTIDAD as readonly string[]).includes(campo));
      const resto = inmediatos.filter(([campo]) => !(CAMPOS_IDENTIDAD as readonly string[]).includes(campo));
      if (resto.length) registros.push({ seccion, cambios: visibles(resto), valores: valores(resto) });
      if (documento.length) registros.push({ seccion: 'Datos de identidad', cambios: visibles(documento), valores: valores(documento) });
    }
    if (aAprobar.length > 0) {
      registros.push({ seccion: 'Datos de identidad', cambios: visibles(aAprobar), valores: valores(aAprobar), pendiente: true });
    }

    inmediatos.forEach(([campo, nuevo]) => this.aplicar(socio, campo, nuevo));
    if (inmediatos.length) await this.socios.guardar(socio);
    for (const r of registros) {
      await this.registro.registrar({ socioId: socio.id, socioNombre: nombreAntes, autor: autor.nombre, ...r });
    }

    return aAprobar.length > 0 ? 'pendiente' : true;
  }
}
