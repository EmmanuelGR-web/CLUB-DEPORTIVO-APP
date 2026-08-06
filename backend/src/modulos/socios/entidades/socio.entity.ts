// =====================================================================
// socio.entity.ts
// -----------------------------------------------------------------------
// Representa la tabla "socios" en la base de datos. Cada propiedad de
// esta clase es una COLUMNA de la tabla. TypeORM usa esta definición
// para saber cómo leer y escribir datos en PostgreSQL.
//
// Nota importante de diseño: el campo "idSocio" (número de socio) es
// DISTINTO del "id" interno (uuid). El id interno es técnico y nunca
// se muestra al usuario; el idSocio es el número real que ve el socio
// en su carnet y que, como pediste, NUNCA se puede modificar desde
// la app una vez asignado.
// =====================================================================

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Rol } from '../../../comun/enums/rol.enum';
import { CategoriaSocio } from './categoria-socio.entity';

@Entity('socios')
export class Socio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Número de socio público, único, autogenerado al crear la cuenta.
  // Se marca como @Index para que las búsquedas por número de socio
  // (muy frecuentes, ej. en el mostrador del club) sean rápidas
  // incluso con 20.000+ registros.
  @Index({ unique: true })
  @Column({ name: 'id_socio', type: 'bigint', unique: true })
  idSocio: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Index({ unique: true })
  @Column({ length: 150, unique: true })
  email: string;

  // Nunca se devuelve este campo en las respuestas de la API
  // (select: false), así evitamos filtrar el hash por accidente.
  @Column({ name: 'contrasena_hash', select: false })
  contrasenaHash: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string | null;

  @Column({ name: 'fecha_nacimiento', type: 'date', nullable: true })
  fechaNacimiento: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ciudad: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provincia: string | null;

  @Column({ length: 200, nullable: true })
  direccion: string | null;

  // URL de la foto que el socio cargó para su carnet (almacenada en
  // Supabase Storage / R2, acá solo guardamos el link).
  @Column({ name: 'foto_carnet_url', type: 'text', nullable: true })
  fotoCarnetUrl: string | null;

  // Fecha en la que se hizo socio: es la base para calcular la
  // antigüedad y, con eso, la categoría (oro/plata/bronce).
  @Column({ name: 'fecha_alta', type: 'date' })
  fechaAlta: Date;

  @ManyToOne(() => CategoriaSocio, { eager: true, nullable: true })
  @JoinColumn({ name: 'categoria_id' })
  categoria: CategoriaSocio | null;

  // Rol dentro del sistema: la gran mayoría son 'socio'. El personal
  // del club tiene 'administrativo' o 'admin_principal'.
  @Column({ type: 'enum', enum: Rol, default: Rol.SOCIO })
  rol: Rol;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;

  // ---------------------------------------------------------------
  // Método de dominio: calcula la antigüedad en años completos.
  // Se calcula "al vuelo" en vez de guardarse fija en la base, para
  // que siempre esté actualizada sin necesidad de un proceso batch.
  // ---------------------------------------------------------------
  calcularAntiguedadEnAnios(): number {
    // IMPORTANTE: TypeORM devuelve las columnas de tipo "date" de
    // PostgreSQL como STRING (ej: "2026-08-05"), no como objeto Date
    // de JavaScript, aunque acá arriba la propiedad esté tipada como
    // "Date". Por eso hay que convertirla explícitamente antes de
    // usar métodos como .getFullYear(); si no, falla en tiempo de
    // ejecución aunque TypeScript no marque ningún error al compilar.
    const fechaAltaComoDate = new Date(this.fechaAlta);
    const hoy = new Date();

    let anios = hoy.getFullYear() - fechaAltaComoDate.getFullYear();
    const noCumplioAnioTodavia =
      hoy.getMonth() < fechaAltaComoDate.getMonth() ||
      (hoy.getMonth() === fechaAltaComoDate.getMonth() &&
        hoy.getDate() < fechaAltaComoDate.getDate());
    if (noCumplioAnioTodavia) anios--;
    return anios;
  }
}
