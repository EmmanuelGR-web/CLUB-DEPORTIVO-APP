// =====================================================================
// pagos.service.ts
// -----------------------------------------------------------------------
// Arma el estado de cuenta del socio y registra los pagos informados.
//
// Cada mes desde el alta genera una cuota (ver cuotas.util.ts). Para
// cada período se busca el pago vivo (pendiente o aprobado): si no hay,
// la cuota figura Pendiente o Vencida con el recargo calculado a hoy.
// Si el socio paga con débito automático, el cobro se registra solo.
// =====================================================================

import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Pago, VerificacionIA } from './entidades/pago.entity';
import { EstadoPago } from './entidades/estado-pago.enum';
import { Socio } from '../socios/entidades/socio.entity';
import { Archivo, ArchivoAdjunto } from '../archivos/archivo.entity';
import { ArchivoNuevo, ArchivosService } from '../archivos/archivos.service';
import { calcularCuota, periodosDesdeAlta, PeriodoCuota } from '../../comun/utilidades/cuotas.util';

export const MEDIOS_INFORMADOS = ['Transferencia', 'Billetera virtual', 'Depósito', 'Efectivo'];

export type EstadoCuota = 'Aprobado' | 'En revisión' | 'Pendiente' | 'Vencido';

export interface CuotaEstadoCuenta {
  id: string; // = periodo, para ordenar como en pantalla
  pagoId: string | null;
  periodo: string;
  fecha: string; // MM/AAAA
  anio: number;
  concepto: string;
  medio: string;
  base: number;
  recargo: number;
  diasDemora: number;
  monto: number;
  estado: EstadoCuota;
  vence: string;
  comprobante: ArchivoAdjunto | null;
  informe: {
    fechaPago: string;
    medio: string;
    estado: 'En revisión' | 'Aprobado' | 'Rechazado';
    motivo: string | null;
    informadoEn: string;
    verificacionIA: VerificacionIA | null;
  } | null;
}

export interface InformePago {
  periodo: string;
  fechaPago: string;
  medio: string;
  comprobante: ArchivoNuevo;
  verificacionIA?: VerificacionIA | null;
}

const textoMedio = (socio: Socio) => (socio.medioPago?.tipo === 'tarjeta' ? 'Tarjeta' : 'Efectivo');
const fechaIso = (fecha: Date) => fecha.toISOString().slice(0, 10);
const estadoInforme = { pendiente: 'En revisión', aprobado: 'Aprobado', rechazado: 'Rechazado' } as const;

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago) private readonly repositorioPagos: Repository<Pago>,
    @InjectRepository(Archivo) private readonly repositorioArchivos: Repository<Archivo>,
    private readonly archivos: ArchivosService,
    private readonly fuente: DataSource,
  ) {}

  pagosDeSocio(socioId: string) {
    return this.repositorioPagos.find({ where: { socioId }, order: { informadoEn: 'DESC' } });
  }

  // Cobra solas las cuotas sin pagar de quien tiene débito automático.
  private async debitarAutomaticamente(socio: Socio, periodos: PeriodoCuota[], pagos: Pago[], hoy: Date) {
    if (socio.medioPago?.tipo !== 'tarjeta' || !socio.medioPago.debitoAutomatico) return pagos;
    const vivos = new Set(pagos.filter((p) => p.estado !== EstadoPago.RECHAZADO).map((p) => p.periodo));
    const aDebitar = periodos.filter((p) => !vivos.has(p.periodo));
    if (aDebitar.length === 0) return pagos;

    const nuevos = aDebitar.map((p) =>
      this.repositorioPagos.create({
        socioId: socio.id,
        periodo: p.periodo,
        concepto: p.concepto,
        base: String(p.base),
        recargo: '0',
        diasDemora: 0,
        monto: String(p.base),
        medioPago: 'Tarjeta',
        estado: EstadoPago.APROBADO,
        fechaPago: new Date(Math.min(hoy.getTime(), new Date(p.anio, p.mes, 1, 12).getTime())),
        resueltoPor: 'Débito automático',
        resueltoEn: hoy,
      }),
    );
    // Si dos pedidos llegan juntos, el índice único evita debitar dos veces.
    await this.repositorioPagos.createQueryBuilder().insert().values(nuevos).orIgnore().execute();
    return this.pagosDeSocio(socio.id);
  }

  async estadoDeCuenta(socio: Socio, hoy = new Date()): Promise<CuotaEstadoCuenta[]> {
    const periodos = periodosDesdeAlta(socio.fechaAltaComoFecha, hoy);
    const pagos = await this.debitarAutomaticamente(socio, periodos, await this.pagosDeSocio(socio.id), hoy);

    const idsComprobantes = pagos.map((p) => p.comprobanteId).filter((id): id is string => Boolean(id));
    const comprobantes = idsComprobantes.length
      ? await this.repositorioArchivos.find({ where: { id: In(idsComprobantes) } })
      : [];
    const comprobantePorId = new Map(comprobantes.map((a) => [a.id, { id: a.id, nombre: a.nombre, tipo: a.tipo, tamanio: a.tamanio }]));

    return periodos
      .map((p) => {
        // pagos viene ordenado del más nuevo al más viejo.
        const delPeriodo = pagos.filter((pago) => pago.periodo === p.periodo);
        const vivo = delPeriodo.find((pago) => pago.estado !== EstadoPago.RECHAZADO);
        const ultimo = vivo ?? delPeriodo[0];
        const fila: CuotaEstadoCuenta = {
          id: p.periodo,
          pagoId: ultimo?.id ?? null,
          periodo: p.periodo,
          fecha: `${String(p.mes + 1).padStart(2, '0')}/${p.anio}`,
          anio: p.anio,
          concepto: p.concepto,
          medio: textoMedio(socio),
          base: p.base,
          recargo: 0,
          diasDemora: 0,
          monto: p.base,
          estado: 'Pendiente',
          vence: p.vence.toISOString(),
          comprobante: ultimo?.comprobanteId ? (comprobantePorId.get(ultimo.comprobanteId) ?? null) : null,
          informe: ultimo
            ? {
                fechaPago: fechaIso(ultimo.fechaPago),
                medio: ultimo.medioPago,
                estado: estadoInforme[ultimo.estado],
                motivo: ultimo.observacion,
                informadoEn: ultimo.informadoEn.toISOString(),
                verificacionIA: ultimo.verificacionIA,
              }
            : null,
        };

        if (vivo) {
          return {
            ...fila,
            medio: vivo.medioPago,
            recargo: Number(vivo.recargo),
            diasDemora: vivo.diasDemora,
            monto: Number(vivo.monto),
            estado: vivo.estado === EstadoPago.APROBADO ? 'Aprobado' : 'En revisión',
          } satisfies CuotaEstadoCuenta;
        }
        const cuota = calcularCuota(p.base, hoy, p.vence);
        return {
          ...fila,
          recargo: cuota.recargo,
          diasDemora: cuota.dias,
          monto: cuota.total,
          estado: cuota.dias > 0 ? 'Vencido' : 'Pendiente',
        } satisfies CuotaEstadoCuenta;
      })
      .reverse();
  }

  async informar(socio: Socio, datos: InformePago, hoy = new Date()) {
    const periodo = periodosDesdeAlta(socio.fechaAltaComoFecha, hoy).find((p) => p.periodo === datos.periodo);
    if (!periodo) throw new BadRequestException('Esa cuota no corresponde a tu cuenta.');
    if (!MEDIOS_INFORMADOS.includes(datos.medio)) throw new BadRequestException('Elegí cómo pagaste.');

    const fechaPago = new Date(`${datos.fechaPago}T12:00:00`);
    if (Number.isNaN(fechaPago.getTime()) || datos.fechaPago > fechaIso(hoy)) {
      throw new BadRequestException('La fecha de pago no puede ser futura.');
    }

    const yaInformado = await this.repositorioPagos.exists({
      where: { socioId: socio.id, periodo: datos.periodo, estado: In([EstadoPago.PENDIENTE, EstadoPago.APROBADO]) },
    });
    if (yaInformado) throw new ConflictException('Esa cuota ya tiene un pago informado.');

    // El monto se calcula acá con la fecha que informa el socio: no se
    // confía en el que manda el navegador.
    const cuota = calcularCuota(periodo.base, fechaPago, periodo.vence);
    const verificacion = datos.verificacionIA ? { ...datos.verificacionIA, montoEsperado: cuota.total } : null;

    return this.fuente.transaction(async (gestor) => {
      const comprobante = await this.archivos.guardar(datos.comprobante, socio.id, gestor);
      const repositorio = gestor.getRepository(Pago);
      return repositorio.save(
        repositorio.create({
          socioId: socio.id,
          periodo: periodo.periodo,
          concepto: periodo.concepto,
          base: String(cuota.base),
          recargo: String(cuota.recargo),
          diasDemora: cuota.dias,
          monto: String(cuota.total),
          medioPago: datos.medio,
          estado: EstadoPago.PENDIENTE,
          fechaPago,
          comprobanteId: comprobante.id,
          verificacionIA: verificacion,
        }),
      );
    });
  }
}
