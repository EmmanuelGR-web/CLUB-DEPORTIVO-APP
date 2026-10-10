// =====================================================================
// socio.entity.ts
// -----------------------------------------------------------------------
// Tabla "socios". Guarda tanto a los socios como al personal del club:
// lo que cambia es el rol. La categoría y la cuota no se guardan acá,
// se calculan según la antigüedad (ver cuotas.util.ts).
// =====================================================================

import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Rol } from '../../../comun/enums/rol.enum';
import { CategoriaSocio } from './categoria-socio.entity';

export interface MedioPagoSocio {
  tipo: 'tarjeta' | 'efectivo';
  debitoAutomatico: boolean;
  emisor?: string;
  red?: string | null;
  ultimos4?: string;
}

export type EstadoSocio = 'En validación' | 'Activo' | 'Rechazado';

@Entity('socios')
export class Socio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Número de socio visible e inmutable (lo genera una secuencia).
  @Index({ unique: true })
  @Column({ name: 'id_socio', type: 'bigint', unique: true, insert: false, update: false })
  idSocio: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Index({ unique: true })
  @Column({ length: 150, unique: true })
  email: string;

  // select: false para que el hash nunca viaje por accidente en una respuesta.
  @Column({ name: 'contrasena_hash', select: false })
  contrasenaHash: string;

  @Column({ type: 'varchar', length: 8, nullable: true, unique: true })
  dni: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string | null;

  @Column({ name: 'fecha_nacimiento', type: 'date', nullable: true })
  fechaNacimiento: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ciudad: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provincia: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  direccion: string | null;

  // Foto del carnet como data URL (320 × 320 px, JPEG).
  @Column({ name: 'foto_carnet_url', type: 'text', nullable: true })
  foto: string | null;

  @Column({ name: 'foto_actualizada', type: 'timestamptz', nullable: true })
  fotoActualizada: Date | null;

  @Column({ name: 'fecha_alta', type: 'date' })
  fechaAlta: string;

  @ManyToOne(() => CategoriaSocio, { eager: true, nullable: true })
  @JoinColumn({ name: 'categoria_id' })
  categoria: CategoriaSocio | null;

  @Column({ type: 'enum', enum: Rol, default: Rol.SOCIO })
  rol: Rol;

  @Column({ type: 'varchar', length: 20, default: 'Activo' })
  estado: EstadoSocio;

  @Column({ name: 'medio_pago', type: 'jsonb', default: () => `'{"tipo": "efectivo", "debitoAutomatico": false}'` })
  medioPago: MedioPagoSocio;

  @Column({ name: 'debe_cambiar_contrasena', default: false })
  debeCambiarContrasena: boolean;

  @Column({ name: 'lectura_ia', type: 'jsonb', nullable: true })
  lecturaIA: Record<string, unknown> | null;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  get nombreCompleto() {
    return `${this.nombre} ${this.apellido}`.trim();
  }

  // La fecha de alta es un DATE: se arma al mediodía local para que no
  // se corra un día por la zona horaria.
  get fechaAltaComoFecha() {
    return new Date(`${String(this.fechaAlta).slice(0, 10)}T12:00:00`);
  }
}
