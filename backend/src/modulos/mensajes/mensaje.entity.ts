import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ArchivoAdjunto } from '../archivos/archivo.entity';

// Un hilo 'socio' es la conversación de un socio con administración.
// Un hilo 'interno' es entre la dirección y una persona del personal
// (en ese caso socio_id apunta al empleado).
@Entity('hilos')
export class Hilo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 10, default: 'socio' })
  tipo: 'socio' | 'interno';

  @Column({ name: 'socio_id', type: 'uuid', nullable: true })
  socioId: string | null;

  @Column({ length: 120 })
  asunto: string;

  @Column({ name: 'leido_por_socio', default: false })
  leidoPorSocio: boolean;

  @Column({ name: 'leido_por_club', default: false })
  leidoPorClub: boolean;

  @Column({ name: 'creado_en', type: 'timestamptz', default: () => 'now()' })
  creadoEn: Date;

  @Column({ name: 'actualizado_en', type: 'timestamptz', default: () => 'now()' })
  actualizadoEn: Date;

  @OneToMany(() => Mensaje, (mensaje) => mensaje.hilo)
  mensajes: Mensaje[];
}

@Entity('mensajes')
export class Mensaje {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Hilo, (hilo) => hilo.mensajes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hilo_id' })
  hilo: Hilo;

  @Column({ name: 'hilo_id', type: 'uuid' })
  hiloId: string;

  @Column({ name: 'autor_id', type: 'uuid', nullable: true })
  autorId: string | null;

  @Column({ name: 'del_club' })
  delClub: boolean;

  @Column({ length: 150 })
  de: string;

  @Column({ length: 150 })
  para: string;

  @Column({ type: 'text' })
  texto: string;

  @Column({ type: 'jsonb', default: () => `'[]'` })
  adjuntos: ArchivoAdjunto[];

  @Column({ type: 'timestamptz', default: () => 'now()' })
  fecha: Date;
}
