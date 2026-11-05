import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jornada, Tramo } from './personal.entity';

const LIMITE_CONEXION = 90 * 1000;

export const fechaLocal = (fecha = new Date()) => fecha.toLocaleDateString('en-CA');

const cerrarAbiertos = (lista: Tramo[], ahora: number) => lista.map((t) => (t.fin ? t : { ...t, fin: ahora }));

export const jornadaParaPanel = (j: Jornada | null) =>
  j && {
    inicio: j.inicio.getTime(),
    ultimaActividad: j.ultimaActividad.getTime(),
    estado: j.estado,
    descansos: j.descansos,
    ausencias: j.ausencias,
    fin: j.fin?.getTime() ?? null,
    terminada: j.terminada,
  };

@Injectable()
export class JornadasService {
  constructor(@InjectRepository(Jornada) private readonly repositorio: Repository<Jornada>) {}

  deHoy(personalId: string) {
    return this.repositorio.findOne({ where: { personalId, fecha: fechaLocal() } });
  }

  todasDeHoy() {
    return this.repositorio.find({ where: { fecha: fechaLocal() } });
  }

  async marcarActividad(personalId: string) {
    const ahora = Date.now();
    const j = await this.deHoy(personalId);
    if (!j) {
      return this.repositorio.save(
        this.repositorio.create({
          personalId,
          fecha: fechaLocal(),
          inicio: new Date(ahora),
          ultimaActividad: new Date(ahora),
          estado: 'trabajando',
          descansos: [],
          ausencias: [],
        }),
      );
    }
    if (j.estado === 'fuera') {
      Object.assign(j, { estado: 'trabajando', terminada: false, fin: null, ultimaActividad: new Date(ahora), ausencias: cerrarAbiertos(j.ausencias, ahora) });
    } else {
      const ultima = j.ultimaActividad.getTime();
      if (ahora - ultima > LIMITE_CONEXION) j.ausencias = [...j.ausencias, { inicio: ultima, fin: ahora }];
      j.ultimaActividad = new Date(ahora);
    }
    return this.repositorio.save(j);
  }

  async iniciarDescanso(personalId: string) {
    const ahora = Date.now();
    const j = await this.deHoy(personalId);
    if (!j || j.estado !== 'trabajando') throw new BadRequestException('Para tomar un descanso tenés que estar trabajando.');
    Object.assign(j, { estado: 'descanso', ultimaActividad: new Date(ahora), descansos: [...j.descansos, { inicio: ahora, fin: null }] });
    return this.repositorio.save(j);
  }

  async terminarDescanso(personalId: string) {
    const ahora = Date.now();
    const j = await this.deHoy(personalId);
    if (!j || j.estado !== 'descanso') throw new BadRequestException('No tenés un descanso en curso.');
    Object.assign(j, { estado: 'trabajando', ultimaActividad: new Date(ahora), descansos: cerrarAbiertos(j.descansos, ahora) });
    return this.repositorio.save(j);
  }

  async registrarSalida(personalId: string, terminada: boolean) {
    const ahora = Date.now();
    const j = await this.deHoy(personalId);
    if (!j || j.estado === 'fuera') return j;
    Object.assign(j, {
      estado: 'fuera',
      terminada,
      fin: new Date(ahora),
      ultimaActividad: new Date(ahora),
      descansos: cerrarAbiertos(j.descansos, ahora),
      ausencias: [...j.ausencias, { inicio: ahora, fin: null }],
    });
    return this.repositorio.save(j);
  }
}
