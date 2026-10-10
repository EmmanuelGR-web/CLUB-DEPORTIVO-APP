import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Comprobantes de pago y adjuntos de mensajes. El contenido (data URL)
// tiene select: false: solo se lee cuando alguien abre el archivo.
@Entity('archivos')
export class Archivo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  nombre: string;

  @Column({ length: 100 })
  tipo: string;

  @Column({ type: 'int' })
  tamanio: number;

  @Column({ type: 'text', select: false })
  datos: string;

  @Column({ name: 'subido_por', type: 'uuid', nullable: true })
  subidoPor: string | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}

export interface ArchivoAdjunto {
  id: string;
  nombre: string;
  tipo: string;
  tamanio: number;
}
