import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('noticias')
export class Noticia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 40 })
  categoria: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ length: 120 })
  titulo: string;

  @Column({ length: 300 })
  resumen: string;

  @Column({ type: 'jsonb', default: () => `'[]'` })
  cuerpo: string[];

  // Link o data URL de una imagen ya optimizada en el navegador.
  @Column({ type: 'text', nullable: true })
  imagen: string | null;

  @Column({ type: 'jsonb', nullable: true })
  enlace: { texto: string; ruta: string } | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
