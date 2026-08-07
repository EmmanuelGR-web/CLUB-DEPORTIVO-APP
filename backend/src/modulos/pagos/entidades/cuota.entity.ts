// =====================================================================
// cuota.entity.ts
// -----------------------------------------------------------------------
// Representa la tabla "cuotas": un período de cobro (ej: "Cuota Agosto
// 2026") con su monto y fecha de vencimiento. La comisión directiva
// (rol admin_principal) es quien crea estas cuotas; los socios las
// pagan, pero no las crean ni las modifican.
// =====================================================================

import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cuotas')
export class Cuota {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Formato "AAAA-MM", ej: "2026-08". Se usa como identificador
  // legible del período, además del id técnico.
  @Column({ type: 'varchar', length: 20, unique: true })
  periodo: string;

  // NUMERIC en vez de "number"/float: TypeORM lo devuelve como string
  // para no perder precisión con decimales de dinero. Se convierte
  // a number solo al mostrarlo, nunca se opera matemáticamente sobre
  // el string directamente sin convertir primero.
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto: string;

  @Column({ name: 'fecha_vencimiento', type: 'date' })
  fechaVencimiento: Date;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
