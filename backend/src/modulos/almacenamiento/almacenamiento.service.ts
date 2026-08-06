// =====================================================================
// almacenamiento.service.ts
// -----------------------------------------------------------------------
// Encapsula TODA la comunicación con Supabase Storage en un solo lugar.
//
// Principio SOLID aplicado: Dependency Inversion + Single Responsibility.
// El resto de la aplicación (por ejemplo SociosService) no necesita
// saber que estamos usando "Supabase" específicamente para guardar
// archivos — solo le importa poder "subir una foto y recibir una URL".
// Si el día de mañana el club decide migrar a otro servicio (Cloudflare
// R2, AWS S3, etc.), el único archivo que hay que tocar es este.
// =====================================================================

import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Tipos de archivo permitidos para las fotos de carnet. Cualquier otro
// tipo (PDF, Word, ejecutables, etc.) se rechaza antes de subir nada.
const TIPOS_IMAGEN_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANIO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class AlmacenamientoService {
  private readonly cliente: SupabaseClient;
  private readonly nombreBucket: string;

  constructor(config: ConfigService) {
    const url = config.get<string>('STORAGE_URL');
    const claveServicio = config.get<string>('STORAGE_CLAVE');
    this.nombreBucket = config.get<string>('STORAGE_BUCKET', 'carnets-socios');

    // El cliente se crea con la clave "service_role", que tiene
    // permisos para escribir archivos sin depender de que el usuario
    // esté autenticado directamente contra Supabase (nuestra propia
    // autenticación con JWT ya se encarga de eso en NestJS).
    this.cliente = createClient(url, claveServicio);
  }

  // Sube la foto de carnet de un socio y devuelve la URL pública para
  // guardar en la columna foto_carnet_url.
  async subirFotoCarnet(
    idSocio: string,
    archivo: { buffer: Buffer; mimetype: string; size: number },
  ): Promise<string> {
    this.validarArchivo(archivo);

    // Usamos el id del socio como nombre de archivo: así, si el mismo
    // socio sube una foto nueva, simplemente se sobrescribe la
    // anterior en vez de acumular archivos viejos sin usar.
    const extension = archivo.mimetype.split('/')[1];
    const rutaArchivo = `${idSocio}.${extension}`;

    const { error } = await this.cliente.storage
      .from(this.nombreBucket)
      .upload(rutaArchivo, archivo.buffer, {
        contentType: archivo.mimetype,
        upsert: true, // true = permite reemplazar si ya existe una foto previa
      });

    if (error) {
      throw new BadRequestException(`No se pudo subir la imagen: ${error.message}`);
    }

    const { data } = this.cliente.storage.from(this.nombreBucket).getPublicUrl(rutaArchivo);

    // Le agregamos una "marca de tiempo" al final de la URL. Sin esto,
    // si un socio cambia su foto, el navegador podría seguir mostrando
    // la versión vieja guardada en caché, porque el nombre de archivo
    // no cambió (a propósito, para no acumular fotos viejas).
    return `${data.publicUrl}?actualizado=${Date.now()}`;
  }

  private validarArchivo(archivo: { mimetype: string; size: number }): void {
    if (!TIPOS_IMAGEN_PERMITIDOS.includes(archivo.mimetype)) {
      throw new BadRequestException(
        `Formato de imagen no permitido. Se aceptan: ${TIPOS_IMAGEN_PERMITIDOS.join(', ')}`,
      );
    }
    if (archivo.size > TAMANIO_MAXIMO_BYTES) {
      throw new BadRequestException('La imagen no puede superar los 5 MB');
    }
  }
}
