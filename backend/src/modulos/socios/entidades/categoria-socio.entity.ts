// =====================================================================
// categoria-socio.entity.ts
// -----------------------------------------------------------------------
// Representa la tabla "categorias_socio": los niveles de antigüedad
// (Oro, Plata, Bronce) que un socio puede tener según sus años como
// miembro del club. Se guarda como tabla propia (y no como texto fijo)
// para que la comisión directiva pueda ajustar los rangos de años
// desde el panel admin sin tocar código.
// =====================================================================

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categorias_socio')
export class CategoriaSocio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  nombre: string; // 'Oro' | 'Plata' | 'Bronce'

  @Column({ name: 'anios_minimos', type: 'int' })
  aniosMinimos: number; // ej: Oro = 15 años o más

  @Column({ name: 'anios_maximos', type: 'int', nullable: true })
  aniosMaximos: number | null; // null significa "sin límite superior"

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;
}
