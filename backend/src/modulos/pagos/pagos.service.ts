// =====================================================================
// pagos.service.ts
// -----------------------------------------------------------------------
// Lógica de negocio de cuotas y pagos. Reglas importantes que se
// aplican acá:
//
// 1. Un socio NUNCA puede auto-aprobarse un pago: todo pago nuevo
//    nace en estado PENDIENTE, y solo el personal del club puede
//    confirmarlo (actualizarEstadoPago).
// 2. No se puede pagar dos veces la misma cuota (la base de datos
//    también lo garantiza con una restricción UNIQUE, pero acá
//    damos un mensaje de error más claro antes de llegar a ese punto).
// 3. Los montos de dinero SIEMPRE se manejan como string/NUMERIC,
//    nunca como "number" de JavaScript, para no perder precisión.
// =====================================================================

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cuota } from './entidades/cuota.entity';
import { Pago } from './entidades/pago.entity';
import { EstadoPago } from './entidades/estado-pago.enum';
import { CrearCuotaDto } from './dto/crear-cuota.dto';
import { RegistrarPagoDto } from './dto/registrar-pago.dto';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Cuota)
    private readonly repositorioCuotas: Repository<Cuota>,
    @InjectRepository(Pago)
    private readonly repositorioPagos: Repository<Pago>,
  ) {}

  // --- Cuotas (solo administración) ---

  async crearCuota(datos: CrearCuotaDto): Promise<Cuota> {
    const yaExiste = await this.repositorioCuotas.findOne({
      where: { periodo: datos.periodo },
    });
    if (yaExiste) {
      throw new ConflictException(`Ya existe una cuota cargada para el período ${datos.periodo}`);
    }

    const cuotaNueva = this.repositorioCuotas.create({
      periodo: datos.periodo,
      monto: datos.monto.toFixed(2), // se guarda como string, sin perder los decimales
      fechaVencimiento: new Date(datos.fechaVencimiento),
    });
    return this.repositorioCuotas.save(cuotaNueva);
  }

  async listarCuotas(): Promise<Cuota[]> {
    return this.repositorioCuotas.find({ order: { fechaVencimiento: 'DESC' } });
  }

  // --- Pagos ---

  // El socio declara el pago de una cuota. Queda en estado PENDIENTE
  // hasta que el club lo confirme (ver actualizarEstadoPago).
  async registrarPago(idSocio: string, datos: RegistrarPagoDto): Promise<Pago> {
    const cuota = await this.repositorioCuotas.findOne({ where: { id: datos.cuotaId } });
    if (!cuota) {
      throw new NotFoundException('La cuota indicada no existe');
    }

    const pagoExistente = await this.repositorioPagos.findOne({
      where: { socio: { id: idSocio }, cuota: { id: datos.cuotaId } },
    });
    if (pagoExistente) {
      throw new ConflictException('Ya existe un pago registrado para esta cuota');
    }

    const pagoNuevo = this.repositorioPagos.create({
      socio: { id: idSocio },
      cuota: { id: datos.cuotaId },
      monto: cuota.monto, // se cobra el monto vigente de la cuota, no un valor "a mano"
      medioPago: datos.medioPago,
      comprobanteUrl: datos.comprobanteUrl ?? null,
      estado: EstadoPago.PENDIENTE,
    });

    return this.repositorioPagos.save(pagoNuevo);
  }

  // Historial de pagos del propio socio (usado por el panel del
  // socio: "pagos realizados y faltantes").
  async listarPagosDeSocio(idSocio: string): Promise<Pago[]> {
    return this.repositorioPagos.find({
      where: { socio: { id: idSocio } },
      order: { fechaPago: 'DESC' },
    });
  }

  // Arma el "estado de cuenta" del socio: compara todas las cuotas
  // existentes contra los pagos que ese socio ya hizo, para mostrarle
  // claramente qué tiene pagado y qué le falta.
  async obtenerEstadoDeCuenta(idSocio: string) {
    const [todasLasCuotas, pagosDelSocio] = await Promise.all([
      this.listarCuotas(),
      this.listarPagosDeSocio(idSocio),
    ]);

    return todasLasCuotas.map((cuota) => {
      const pagoCorrespondiente = pagosDelSocio.find((pago) => pago.cuota.id === cuota.id);
      return {
        cuotaId: cuota.id,
        periodo: cuota.periodo,
        monto: cuota.monto,
        fechaVencimiento: cuota.fechaVencimiento,
        estadoPago: pagoCorrespondiente?.estado ?? 'sin_pagar',
      };
    });
  }

  // --- Administración de pagos (solo personal del club) ---

  async listarPagosPendientes(): Promise<Pago[]> {
    return this.repositorioPagos.find({
      where: { estado: EstadoPago.PENDIENTE },
      order: { fechaPago: 'ASC' },
    });
  }

  async actualizarEstadoPago(idPago: string, nuevoEstado: EstadoPago): Promise<Pago> {
    const pago = await this.repositorioPagos.findOne({ where: { id: idPago } });
    if (!pago) {
      throw new NotFoundException('El pago indicado no existe');
    }
    pago.estado = nuevoEstado;
    return this.repositorioPagos.save(pago);
  }
}
