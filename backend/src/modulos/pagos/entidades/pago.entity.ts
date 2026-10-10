// =====================================================================
// pago.entity.ts
// -----------------------------------------------------------------------
// Tabla "pagos". Cada fila es un pago informado por el socio (o
// debitado de su tarjeta) para un período "AAAA-MM". Mientras el
// personal no lo revisa queda 'pendiente' ("En revisión" en pantalla).
// Un socio puede tener un solo pago vivo por período; si se lo
// rechazan, puede informarlo de nuevo.
// =====================================================================

import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Socio } from '../../socios/entidades/socio.entity';
import { EstadoPago } from './estado-pago.enum';

export interface VerificacionIA {
  leido: boolean;
  esComprobante?: boolean;
  monto?: number | null;
  fecha?: string;
  numeroOperacion?: string;
  origen?: string;
  destino?: string;
  observaciones?: string;
  montoEsperado?: number;
  coincideMonto?: boolean;
  coincideFecha?: boolean;
  motivo?: string;
}

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Socio, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'socio_id' })
  socio: Socio;

  @Column({ name: 'socio_id' })
  socioId: string;

  @Column({ length: 7 })
  periodo: string;

  @Column({ length: 40, default: 'Cuota mensual' })
  concepto: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  base: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  recargo: string;

  @Column({ name: 'dias_demora', type: 'int', default: 0 })
  diasDemora: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto: string;

  @Column({ name: 'medio_pago', length: 30 })
  medioPago: string;

  @Column({ type: 'enum', enum: EstadoPago, default: EstadoPago.PENDIENTE })
  estado: EstadoPago;

  // Fecha en la que el socio dice que pagó.
  @Column({ name: 'fecha_pago', type: 'timestamptz' })
  fechaPago: Date;

  @Column({ name: 'informado_en', type: 'timestamptz', default: () => 'now()' })
  informadoEn: Date;

  @Column({ name: 'comprobante_id', type: 'uuid', nullable: true })
  comprobanteId: string | null;

  @Column({ name: 'verificacion_ia', type: 'jsonb', nullable: true })
  verificacionIA: VerificacionIA | null;

  @Column({ name: 'numero_comprobante', type: 'varchar', length: 30, unique: true, nullable: true })
  numeroComprobante: string | null;

  // Motivo del rechazo o comentario del personal.
  @Column({ type: 'text', nullable: true })
  observacion: string | null;

  @Column({ name: 'resuelto_por', type: 'varchar', length: 120, nullable: true })
  resueltoPor: string | null;

  @Column({ name: 'resuelto_en', type: 'timestamptz', nullable: true })
  resueltoEn: Date | null;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
