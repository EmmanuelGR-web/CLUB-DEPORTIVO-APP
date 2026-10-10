// =====================================================================
// mensajes.service.ts
// -----------------------------------------------------------------------
// Bandeja de entrada del portal. Cada hilo tiene dos marcas de leído:
// la del socio (o del empleado, en un hilo interno) y la del club.
// Los adjuntos se guardan en la tabla archivos y el mensaje solo
// guarda nombre, tipo y tamaño.
// =====================================================================

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Hilo, Mensaje } from './mensaje.entity';
import { ArchivoNuevo, ArchivosService } from '../archivos/archivos.service';

export const MAXIMO_ADJUNTOS = 3;

export interface MensajeNuevo {
  asunto?: string;
  texto: string;
  adjuntos?: ArchivoNuevo[];
}

export interface Remitente {
  autorId: string | null;
  delClub: boolean;
  de: string;
  para: string;
}

@Injectable()
export class MensajesService {
  constructor(
    @InjectRepository(Hilo) private readonly repositorioHilos: Repository<Hilo>,
    private readonly archivos: ArchivosService,
    private readonly fuente: DataSource,
  ) {}

  // Hilos de un socio (o de un empleado en el canal interno), con sus
  // mensajes en orden y el más reciente primero.
  async hilosDe(socioId: string, tipo: Hilo['tipo'] = 'socio') {
    const hilos = await this.repositorioHilos.find({
      where: { socioId, tipo },
      relations: { mensajes: true },
      order: { actualizadoEn: 'DESC', mensajes: { fecha: 'ASC' } },
    });
    return hilos;
  }

  private validar(mensaje: MensajeNuevo, conAsunto: boolean) {
    if (!mensaje.texto?.trim()) throw new BadRequestException('El mensaje no puede estar vacío.');
    if (mensaje.texto.length > 1000) throw new BadRequestException('El mensaje es demasiado largo.');
    if (conAsunto && !mensaje.asunto?.trim()) throw new BadRequestException('Escribí un asunto.');
    if ((mensaje.adjuntos?.length ?? 0) > MAXIMO_ADJUNTOS) {
      throw new BadRequestException(`Podés adjuntar hasta ${MAXIMO_ADJUNTOS} archivos por mensaje.`);
    }
    mensaje.adjuntos?.forEach((a) => this.archivos.validar(a));
  }

  private async agregarMensaje(gestor: EntityManager, hiloId: string, remitente: Remitente, mensaje: MensajeNuevo) {
    const adjuntos = [];
    for (const archivo of mensaje.adjuntos ?? []) {
      adjuntos.push(await this.archivos.guardar(archivo, remitente.autorId, gestor));
    }
    const repositorio = gestor.getRepository(Mensaje);
    return repositorio.save(repositorio.create({ hiloId, ...remitente, texto: mensaje.texto.trim(), adjuntos }));
  }

  async crearHilo(socioId: string, tipo: Hilo['tipo'], remitente: Remitente, mensaje: MensajeNuevo, gestorExterno?: EntityManager) {
    this.validar(mensaje, true);
    const ejecutar = async (gestor: EntityManager) => {
      const repositorio = gestor.getRepository(Hilo);
      const hilo = await repositorio.save(
        repositorio.create({
          socioId,
          tipo,
          asunto: mensaje.asunto!.trim().slice(0, 120),
          leidoPorSocio: !remitente.delClub,
          leidoPorClub: remitente.delClub,
        }),
      );
      await this.agregarMensaje(gestor, hilo.id, remitente, mensaje);
      return hilo;
    };
    return gestorExterno ? ejecutar(gestorExterno) : this.fuente.transaction(ejecutar);
  }

  async buscarHilo(hiloId: string, socioId?: string) {
    const hilo = await this.repositorioHilos.findOne({ where: { id: hiloId, ...(socioId ? { socioId } : {}) } });
    if (!hilo) throw new NotFoundException('La conversación no existe.');
    return hilo;
  }

  async responder(hilo: Hilo, remitente: Remitente, mensaje: MensajeNuevo) {
    this.validar(mensaje, false);
    return this.fuente.transaction(async (gestor) => {
      await this.agregarMensaje(gestor, hilo.id, remitente, mensaje);
      // Quien responde ya lo leyó; el otro lado lo ve como nuevo.
      await gestor.getRepository(Hilo).update(hilo.id, {
        leidoPorSocio: !remitente.delClub,
        leidoPorClub: remitente.delClub,
        actualizadoEn: new Date(),
      });
    });
  }

  marcarLeido(hilo: Hilo, lado: 'socio' | 'club') {
    return this.repositorioHilos.update(hilo.id, lado === 'socio' ? { leidoPorSocio: true } : { leidoPorClub: true });
  }
}
