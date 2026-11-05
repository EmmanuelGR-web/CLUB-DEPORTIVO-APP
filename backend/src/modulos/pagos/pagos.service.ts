import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Not, Repository } from 'typeorm';
import { Pago, VerificacionIA } from './entidades/pago.entity';
import { EstadoPago } from './entidades/estado-pago.enum';
import { Socio } from '../socios/entidades/socio.entity';
import { Archivo, ArchivoAdjunto } from '../archivos/archivo.entity';
import { ArchivoNuevo, ArchivosService } from '../archivos/archivos.service';
import { calcularCuota, periodosDesdeAlta, PeriodoCuota } from '../../comun/utilidades/cuotas.util';

export const MEDIOS_INFORMADOS = ['Transferencia', 'Billetera virtual', 'Depósito', 'Efectivo'];

export type EstadoCuota = 'Aprobado' | 'En revisión' | 'Pendiente' | 'Vencido';

export interface CuotaEstadoCuenta {
  id: string;
  pagoId: string | null;
  periodo: string;
  fecha: string;
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
    await this.repositorioPagos.createQueryBuilder().insert().values(nuevos).orIgnore().execute();
    return this.pagosDeSocio(socio.id);
  }

  async estadoDeCuenta(socio: Socio, hoy = new Date()): Promise<CuotaEstadoCuenta[]> {
    const periodos = periodosDesdeAlta(socio.fechaAltaComoFecha, hoy);
    const pagos = await this.debitarAutomaticamente(socio, periodos, await this.pagosDeSocio(socio.id), hoy);
    const comprobantes = await this.archivosDe(pagos.map((p) => p.comprobanteId).filter((id): id is string => Boolean(id)));
    return this.armarEstado(socio, periodos, pagos, comprobantes, hoy);
  }

  async estadosDeCuenta(socios: Socio[], hoy = new Date()) {
    const ids = socios.map((s) => s.id);
    let pagos = ids.length ? await this.repositorioPagos.find({ where: { socioId: In(ids) }, order: { informadoEn: 'DESC' } }) : [];
    const porSocio = (id: string) => pagos.filter((p) => p.socioId === id);

    let debito = false;
    for (const socio of socios) {
      const antes = porSocio(socio.id);
      const despues = await this.debitarAutomaticamente(socio, periodosDesdeAlta(socio.fechaAltaComoFecha, hoy), antes, hoy);
      if (despues !== antes) debito = true;
    }
    if (debito) pagos = await this.repositorioPagos.find({ where: { socioId: In(ids) }, order: { informadoEn: 'DESC' } });

    const comprobantes = await this.archivosDe(pagos.map((p) => p.comprobanteId).filter((id): id is string => Boolean(id)));
    return new Map(socios.map((s) => [s.id, this.armarEstado(s, periodosDesdeAlta(s.fechaAltaComoFecha, hoy), porSocio(s.id), comprobantes, hoy)]));
  }

  private armarEstado(socio: Socio, periodos: PeriodoCuota[], pagos: Pago[], comprobantePorId: Map<string, ArchivoAdjunto>, hoy: Date): CuotaEstadoCuenta[] {
    return periodos
      .map((p) => {
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

  informadosConComprobante() {
    return this.repositorioPagos.find({ where: { comprobanteId: Not(IsNull()) }, order: { informadoEn: 'DESC' } });
  }

  async archivosDe(ids: string[]) {
    if (ids.length === 0) return new Map<string, ArchivoAdjunto>();
    const archivos = await this.repositorioArchivos.find({ where: { id: In(ids) } });
    return new Map(archivos.map((a) => [a.id, { id: a.id, nombre: a.nombre, tipo: a.tipo, tamanio: a.tamanio }]));
  }

  async buscarPago(id: string) {
    const pago = await this.repositorioPagos.findOne({ where: { id } });
    if (!pago) throw new BadRequestException('El pago no existe.');
    return pago;
  }

  async resolver(pago: Pago, aprobado: boolean, motivo: string, firma: string) {
    if (pago.estado !== EstadoPago.PENDIENTE) throw new ConflictException('Ese pago ya fue revisado.');
    pago.estado = aprobado ? EstadoPago.APROBADO : EstadoPago.RECHAZADO;
    pago.observacion = motivo || null;
    pago.resueltoPor = firma;
    pago.resueltoEn = new Date();
    if (aprobado) pago.numeroComprobante = `REC-${new Date().getFullYear()}-${pago.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    return this.repositorioPagos.save(pago);
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
