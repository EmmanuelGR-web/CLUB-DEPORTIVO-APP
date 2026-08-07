// =====================================================================
// pago.entity.ts
// -----------------------------------------------------------------------
// Representa la tabla "pagos": cada pago (o intento de pago) que un
// socio hace contra una cuota específica. La restricción UNIQUE en
// la base de datos (socio_id + cuota_id) impide que un mismo socio
// pague dos veces la misma cuota por error.
// =====================================================================

import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @CreateDateColumn({ name: 'fecha_pago' })
  fechaPago: Date;
}
