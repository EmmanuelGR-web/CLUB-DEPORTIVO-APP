import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categorias_socio')
export class CategoriaSocio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  nombre: string;

  @Column({ name: 'anios_minimos', type: 'int' })
  aniosMinimos: number;

  @Column({ name: 'anios_maximos', type: 'int', nullable: true })
  aniosMaximos: number | null;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;
}
