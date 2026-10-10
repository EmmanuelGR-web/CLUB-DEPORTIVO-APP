import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { CambioVisible, RegistroCambio, ValoresCambio } from './registro-cambio.entity';

export interface NuevoRegistro {
  socioId: string | null;
  socioNombre: string;
  seccion: string;
  cambios: CambioVisible[];
  autor?: string;
  valores?: ValoresCambio | null;
  pendiente?: boolean;
}

@Injectable()
export class RegistroCambiosService {
  constructor(@InjectRepository(RegistroCambio) private readonly repositorio: Repository<RegistroCambio>) {}

  async registrar(datos: NuevoRegistro, gestor?: EntityManager) {
    if (datos.cambios.length === 0) return null;
    const repositorio = gestor?.getRepository(RegistroCambio) ?? this.repositorio;
    return repositorio.save(
      repositorio.create({
        socioId: datos.socioId,
        socioNombre: datos.socioNombre,
        seccion: datos.seccion,
        autor: datos.autor ?? 'Socio',
        cambios: datos.cambios,
        valores: datos.valores ?? null,
        pendiente: datos.pendiente ?? false,
      }),
    );
  }

  listarTodos(limite = 500) {
    return this.repositorio.find({ order: { fecha: 'DESC' }, take: limite });
  }

  async buscar(id: string) {
    const registro = await this.repositorio.findOne({ where: { id } });
    if (!registro) throw new NotFoundException('La solicitud no existe.');
    return registro;
  }

  marcarResuelto(registro: RegistroCambio, resultado: 'Autorizado' | 'Rechazado', motivo: string, firma: string) {
    Object.assign(registro, { resuelto: resultado, motivo: motivo || null, resueltoPor: firma, resueltoEn: new Date() });
    return this.repositorio.save(registro);
  }

  listarDeSocio(socioId: string) {
    return this.repositorio.find({ where: { socioId }, order: { fecha: 'DESC' } });
  }

  // Pedido de cambio de nombre, DNI o nacimiento que todavía espera
  // la aprobación del personal.
  identidadPendiente(socioId: string) {
    return this.repositorio.findOne({
      where: { socioId, pendiente: true, resuelto: IsNull(), seccion: 'Datos de identidad' },
      order: { fecha: 'DESC' },
    });
  }
}
