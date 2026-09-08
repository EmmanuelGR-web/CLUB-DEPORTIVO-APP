// =====================================================================
// pagos.service.ts
// -----------------------------------------------------------------------
// Lógica de negocio de cuotas y pagos. Reglas importantes que se
// aplican acá:
//
// 1. Un socio NUNCA puede auto-aprobarse un pago: todo pago nuevo
//    nace en estado PENDIENTE, y solo el personal del club puede
//    confirmarlo (actualizarEstadoPago).
// 2. No se puede tener dos pagos "vivos" (pendiente o aprobado) para
//    la misma cuota (la base de datos también lo garantiza con un
//    índice único parcial, pero acá damos un mensaje de error más
//    claro antes de llegar a ese punto). Si el único pago previo fue
//    RECHAZADO, el socio SÍ puede reintentar: se reutiliza ese mismo
//    registro en vez de crear uno nuevo, así queda el historial de
//    que hubo un rechazo antes.
// 3. Los montos de dinero SIEMPRE se manejan como string/NUMERIC,
//    nunca como "number" de JavaScript, para no perder precisión.
// 4. Cuando un pago pasa a APROBADO se le genera automáticamente un
//    número de comprobante/cupón único, que el socio puede consultar
//    después (ver obtenerComprobante).
// =====================================================================

import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cuota } from './entidades/cuota.entity';
import { Pago } from './entidades/pago.entity';
import { EstadoPago } from './entidades/estado-pago.enum';
import { CrearCuotaDto } from './dto/crear-cuota.dto';
import { ActualizarCuotaDto } from './dto/actualizar-cuota.dto';
import { RegistrarPagoDto } from './dto/registrar-pago.dto';
import { Rol } from '../../comun/enums/rol.enum';
import { UsuarioAutenticado } from '../../comun/decoradores/usuario-actual.decorator';
import { generarNumeroComprobante } from '../../comun/utilidades/numero-comprobante.util';

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

  // Corrige el monto o la fecha de vencimiento de una cuota ya
  // creada (ej: error de tipeo, ajuste de precio a mitad de mes).
  // A propósito NO permite tocar el "periodo": ver el comentario en
  // ActualizarCuotaDto para el porqué.
  //
  // Importante: esto NO modifica retroactivamente los pagos que ya
  // se hicieron contra esta cuota. Cada Pago guarda una COPIA del
  // monto vigente al momento de pagar (ver registrarPago), no una
  // referencia viva a la cuota. Si un pago quedó PENDIENTE con el
  // monto viejo y el admin cambia el precio después, ese pago
  // pendiente sigue reflejando el monto con el que se declaró; si
  // hace falta ajustarlo, se rechaza y el socio vuelve a pagar con
  // el monto nuevo.
  async actualizarCuota(idCuota: string, datos: ActualizarCuotaDto): Promise<Cuota> {
    const cuota = await this.repositorioCuotas.findOne({ where: { id: idCuota } });
    if (!cuota) {
      throw new NotFoundException('La cuota indicada no existe');
    }

    if (datos.monto !== undefined) {
      cuota.monto = datos.monto.toFixed(2);
    }
    if (datos.fechaVencimiento !== undefined) {
      cuota.fechaVencimiento = new Date(datos.fechaVencimiento);
    }

    return this.repositorioCuotas.save(cuota);
  }

  // --- Pagos ---

  // El socio declara el pago de una cuota. Queda en estado PENDIENTE
  // hasta que el club lo confirme (ver actualizarEstadoPago).
  async registrarPago(idSocio: string, datos: RegistrarPagoDto): Promise<Pago> {
    const cuota = await this.repositorioCuotas.findOne({ where: { id: datos.cuotaId } });
    if (!cuota) {
      throw new NotFoundException('La cuota indicada no existe');
    }

    const pagoPrevio = await this.repositorioPagos.findOne({
      where: { socio: { id: idSocio }, cuota: { id: datos.cuotaId } },
    });

    // Si ya hay un pago "vivo" (pendiente esperando confirmación, o
    // ya aprobado), no se puede declarar otro para la misma cuota.
    if (pagoPrevio && pagoPrevio.estado !== EstadoPago.RECHAZADO) {
      throw new ConflictException('Ya existe un pago registrado para esta cuota');
    }

    // Si el único pago previo fue RECHAZADO, se permite reintentar:
    // se reutiliza el mismo registro (en vez de crear uno nuevo) para
    // no perder el historial de que hubo un rechazo antes, y se
    // limpian los campos que correspondían al intento fallido.
    if (pagoPrevio && pagoPrevio.estado === EstadoPago.RECHAZADO) {
      pagoPrevio.monto = cuota.monto;
      pagoPrevio.medioPago = datos.medioPago;
      pagoPrevio.comprobanteUrl = datos.comprobanteUrl ?? null;
      pagoPrevio.estado = EstadoPago.PENDIENTE;
      pagoPrevio.numeroComprobante = null;
      pagoPrevio.observacion = null;
      return this.repositorioPagos.save(pagoPrevio);
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
  // socio: "pagos realizados y faltantes"). Acá se ve, entre otras
  // cosas, el medio de pago elegido para cada uno.
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
        // Así el frontend sabe, sin pedir nada más, si hay comprobante
        // para mostrar (pagoId) y cuál es (numeroComprobante).
        pagoId: pagoCorrespondiente?.id ?? null,
        numeroComprobante: pagoCorrespondiente?.numeroComprobante ?? null,
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

  // Detalle completo de un pago puntual: incluye socio, cuota, medio
  // de pago y comprobante. Pensado para que el personal del club
  // pueda revisar un pago específico antes de aprobarlo o rechazarlo.
  async obtenerPagoPorId(idPago: string): Promise<Pago> {
    const pago = await this.repositorioPagos.findOne({ where: { id: idPago } });
    if (!pago) {
      throw new NotFoundException('El pago indicado no existe');
    }
    return pago;
  }

  // Confirma, rechaza o corrige el estado de un pago. Se puede usar
  // tanto para el flujo normal (pendiente -> aprobado/rechazado) como
  // para corregir un error humano (ej: se había aprobado un pago que
  // correspondía a otra cuota), por eso no restringe desde qué estado
  // se puede pasar a cuál.
  async actualizarEstadoPago(
    idPago: string,
    nuevoEstado: EstadoPago,
    observacion?: string,
  ): Promise<Pago> {
    const pago = await this.obtenerPagoPorId(idPago);

    pago.estado = nuevoEstado;
    pago.observacion = observacion ?? null;

    // El comprobante se genera la primera vez que el pago queda
    // aprobado. Si ya tenía uno (ej: se lo rechazó por error y se
    // vuelve a aprobar), se conserva el mismo número en vez de emitir
    // uno nuevo, para no confundir al socio con dos cupones distintos
    // para el mismo pago.
    if (nuevoEstado === EstadoPago.APROBADO && !pago.numeroComprobante) {
      pago.numeroComprobante = generarNumeroComprobante(pago.id, new Date());
    }

    // Si se rechaza un pago que tenía comprobante (corrección de un
    // error), el comprobante deja de ser válido.
    if (nuevoEstado === EstadoPago.RECHAZADO) {
      pago.numeroComprobante = null;
    }

    return this.repositorioPagos.save(pago);
  }

  // Devuelve los datos del cupón/comprobante de un pago aprobado,
  // listos para que el frontend los muestre o los convierta en PDF
  // para imprimir. Un socio solo puede pedir el suyo; el personal
  // del club puede pedir cualquiera (por ejemplo, para reimprimirlo
  // en el mostrador si el socio perdió el comprobante digital).
  async obtenerComprobante(idPago: string, usuarioSolicitante: UsuarioAutenticado) {
    const pago = await this.obtenerPagoPorId(idPago);

    const esDueño = pago.socio.id === usuarioSolicitante.id;
    const esPersonalDelClub = usuarioSolicitante.rol !== Rol.SOCIO;
    if (!esDueño && !esPersonalDelClub) {
      throw new ForbiddenException('No podés ver el comprobante de otro socio');
    }

    if (pago.estado !== EstadoPago.APROBADO || !pago.numeroComprobante) {
      throw new ConflictException('El comprobante solo está disponible para pagos aprobados');
    }

    return {
      numeroComprobante: pago.numeroComprobante,
      fechaEmision: pago.actualizadoEn,
      socio: {
        idSocio: pago.socio.idSocio.toString(),
        nombreCompleto: `${pago.socio.nombre} ${pago.socio.apellido}`,
      },
      cuota: {
        periodo: pago.cuota.periodo,
      },
      medioPago: pago.medioPago,
      monto: pago.monto,
    };
  }
}
