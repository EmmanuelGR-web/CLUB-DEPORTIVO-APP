// =====================================================================
// pago.entity.ts
// -----------------------------------------------------------------------
// Representa la tabla "pagos": cada pago (o intento de pago) que un
// socio hace contra una cuota específica. La restricción UNIQUE en
// la base de datos (socio_id + cuota_id) impide que un mismo socio
// pague dos veces la misma cuota por error.
// =====================================================================

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Socio } from '../../socios/entidades/socio.entity';
import { Cuota } from './cuota.entity';
import { MedioPago } from './medio-pago.enum';
import { EstadoPago } from './estado-pago.enum';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Socio, { eager: true, nullable: false })
  @JoinColumn({ name: 'socio_id' })
  socio: Socio;

  @ManyToOne(() => Cuota, { eager: true, nullable: false })
  @JoinColumn({ name: 'cuota_id' })
  cuota: Cuota;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto: string;

  @Column({ name: 'medio_pago', type: 'enum', enum: MedioPago })
  medioPago: MedioPago;

  @Column({ type: 'enum', enum: EstadoPago, default: EstadoPago.PENDIENTE })
  estado: EstadoPago;

  @Column({ name: 'comprobante_url', type: 'text', nullable: true })
  comprobanteUrl: string | null;

  // Número de cupón/comprobante oficial del pago (ej: "REC-2026-3F9A2B7C").
  // Se completa automáticamente cuando el pago pasa a APROBADO (ver
  // PagosService.actualizarEstadoPago); mientras está pendiente o
  // rechazado, queda en null porque todavía no hay nada que emitir.
  @Column({ name: 'numero_comprobante', type: 'varchar', length: 30, unique: true, nullable: true })
  numeroComprobante: string | null;

  // Nota administrativa opcional: por qué se rechazó un pago, o por
  // qué se corrigió un estado que estaba mal cargado. Queda como
  // constancia visible para el socio y para auditoría interna.
  @Column({ type: 'text', nullable: true })
  observacion: string | null;

  @CreateDateColumn({ name: 'fecha_pago' })
  fechaPago: Date;

  // Distinta de fechaPago (que es de creación): esta se actualiza
  // cada vez que se reintenta un pago rechazado o que el club cambia
  // su estado, para saber cuándo fue el último movimiento real.
  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
