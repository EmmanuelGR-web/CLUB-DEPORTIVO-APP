import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface CambioVisible {
  campo: string;
  anterior: string;
  nuevo: string;
}

export type ValoresCambio = Record<string, { anterior: unknown; nuevo: unknown }>;

@Entity('registro_cambios')
export class RegistroCambio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  fecha: Date;

  @Column({ name: 'socio_id', type: 'uuid', nullable: true })
  socioId: string | null;

  @Column({ name: 'socio_nombre', length: 200 })
  socioNombre: string;

  @Column({ length: 80 })
  seccion: string;

  @Column({ length: 120, default: 'Socio' })
  autor: string;

  @Column({ type: 'jsonb' })
  cambios: CambioVisible[];

  @Column({ type: 'jsonb', nullable: true })
  valores: ValoresCambio | null;

  @Column({ default: false })
  pendiente: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  resuelto: 'Autorizado' | 'Rechazado' | null;

  @Column({ type: 'text', nullable: true })
  motivo: string | null;

  @Column({ name: 'resuelto_por', type: 'varchar', length: 120, nullable: true })
  resueltoPor: string | null;

  @Column({ name: 'resuelto_en', type: 'timestamptz', nullable: true })
  resueltoEn: Date | null;
}
