import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export interface Ausencia {
  motivo: 'Vacaciones' | 'Licencia médica' | 'Licencia personal' | 'Suspensión';
  desde: string; // AAAA-MM-DD
  hasta: string;
  nota?: string;
}

// Nómina del club. usuario_id vincula a quien tiene cuenta en el portal.
@Entity('personal')
export class Personal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 5, unique: true })
  codigo: string;

  @Column({ name: 'usuario_id', type: 'uuid', nullable: true, unique: true })
  usuarioId: string | null;

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 8, nullable: true })
  dni: string | null;

  @Column({ length: 30 })
  rol: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  sector: string | null;

  @Column({ length: 150, unique: true })
  correo: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  telefono: string | null;

  @Column({ length: 30, default: 'Lunes a viernes' })
  dias: string;

  @Column({ length: 5, default: '09:00' })
  entrada: string;

  @Column({ length: 5, default: '17:00' })
  salida: string;

  @Column({ type: 'date' })
  ingreso: string;

  @Column({ type: 'jsonb', nullable: true })
  ausencia: Ausencia | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}

export interface Tramo {
  inicio: number; // milisegundos
  fin: number | null;
}

@Entity('jornadas')
export class Jornada {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'personal_id', type: 'uuid' })
  personalId: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'timestamptz' })
  inicio: Date;

  @Column({ name: 'ultima_actividad', type: 'timestamptz' })
  ultimaActividad: Date;

  @Column({ length: 12, default: 'trabajando' })
  estado: 'trabajando' | 'descanso' | 'fuera';

  @Column({ type: 'jsonb', default: () => `'[]'` })
  descansos: Tramo[];

  @Column({ type: 'jsonb', default: () => `'[]'` })
  ausencias: Tramo[];

  @Column({ type: 'timestamptz', nullable: true })
  fin: Date | null;

  @Column({ default: false })
  terminada: boolean;
}
