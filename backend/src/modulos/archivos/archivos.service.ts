import { BadRequestException, ForbiddenException, Injectable, NotFoundException, PayloadTooLargeException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Archivo, ArchivoAdjunto } from './archivo.entity';
import { Rol } from '../../comun/enums/rol.enum';
import { UsuarioAutenticado } from '../../comun/decoradores/usuario-actual.decorator';

// Imágenes ya optimizadas en el navegador (lado máximo 1600 px) y PDF
// de hasta 1,5 MB, igual que lo que acepta el formulario.
const TIPOS_PERMITIDOS = /^data:(image\/(jpeg|png|webp|gif)|application\/pdf);base64,/;
const MAXIMO_CARACTERES = 2.2 * 1024 * 1024;

export interface ArchivoNuevo {
  nombre: string;
  tipo: string;
  tamanio: number;
  dataUrl: string;
}

@Injectable()
export class ArchivosService {
  constructor(@InjectRepository(Archivo) private readonly repositorio: Repository<Archivo>) {}

  validar(archivo: ArchivoNuevo) {
    if (!archivo?.dataUrl || !TIPOS_PERMITIDOS.test(archivo.dataUrl)) {
      throw new BadRequestException(`"${archivo?.nombre ?? 'El archivo'}" tiene que ser una imagen o un PDF.`);
    }
    if (archivo.dataUrl.length > MAXIMO_CARACTERES) {
      throw new PayloadTooLargeException(`"${archivo.nombre}" es demasiado pesado.`);
    }
  }

  async guardar(archivo: ArchivoNuevo, subidoPor: string | null, gestor?: EntityManager): Promise<ArchivoAdjunto> {
    this.validar(archivo);
    const repositorio = gestor?.getRepository(Archivo) ?? this.repositorio;
    const guardado = await repositorio.save(
      repositorio.create({
        nombre: archivo.nombre.slice(0, 200),
        tipo: archivo.tipo.slice(0, 100),
        tamanio: archivo.tamanio,
        datos: archivo.dataUrl,
        subidoPor,
      }),
    );
    return { id: guardado.id, nombre: guardado.nombre, tipo: guardado.tipo, tamanio: guardado.tamanio };
  }

  // El socio solo puede abrir lo que subió él o lo que le mandó el
  // club en sus mensajes; el personal puede abrir cualquier archivo.
  async abrir(id: string, usuario: UsuarioAutenticado) {
    const archivo = await this.repositorio.createQueryBuilder('a').addSelect('a.datos').where('a.id = :id', { id }).getOne();
    if (!archivo) throw new NotFoundException('El archivo no existe.');
    if (usuario.rol === Rol.SOCIO && archivo.subidoPor !== usuario.id) {
      const enSuBandeja = await this.repositorio.query(
        `SELECT 1 FROM mensajes m JOIN hilos h ON h.id = m.hilo_id
         WHERE h.socio_id = $1 AND m.adjuntos @> $2::jsonb LIMIT 1`,
        [usuario.id, JSON.stringify([{ id }])],
      );
      if (enSuBandeja.length === 0) throw new ForbiddenException('No podés abrir este archivo.');
    }
    return { id: archivo.id, nombre: archivo.nombre, tipo: archivo.tipo, tamanio: archivo.tamanio, dataUrl: archivo.datos };
  }
}
