import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Ausencia, Personal } from './personal.entity';
import { fechaLocal } from './jornadas.service';
import { Rol } from '../../comun/enums/rol.enum';
import { UsuarioAutenticado } from '../../comun/decoradores/usuario-actual.decorator';

// La administración principal no figura en la nómina: firma con D01.
export const DIRECCION = { nombre: 'Laura Gómez', codigo: 'D01', puesto: 'Administradora principal', correo: 'direccion@clubdeportivo.com.ar' };

const PUESTO_POR_ROL: Record<string, string> = {
  Administrativo: 'Personal administrativo',
  Tesorería: 'Tesorería',
  Recepción: 'Recepción',
  Mantenimiento: 'Mantenimiento',
};

const formatoFecha = (dia: string) => new Date(`${dia}T12:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

export function ausenciaVigente(persona: Pick<Personal, 'ausencia'>, hoy = fechaLocal()): Ausencia | null {
  const a = persona.ausencia;
  return a && a.desde <= hoy && hoy <= a.hasta ? a : null;
}

export function textoAusencia(a: Ausencia) {
  const vuelve = new Date(`${a.hasta}T12:00:00`);
  vuelve.setDate(vuelve.getDate() + 1);
  return `${a.motivo} del ${formatoFecha(a.desde)} al ${formatoFecha(a.hasta)}. Vas a poder ingresar el ${formatoFecha(fechaLocal(vuelve))}.`;
}

@Injectable()
export class PersonalService {
  constructor(@InjectRepository(Personal) private readonly repositorio: Repository<Personal>) {}

  listar() {
    return this.repositorio.find({ order: { codigo: 'ASC' } });
  }

  // Legajo nuevo: el que sigue al más alto (A06 después de A05).
  private async siguienteCodigo() {
    const codigos = (await this.repositorio.find({ select: { codigo: true } })).map((p) => Number(p.codigo.slice(1)) || 0);
    return `A${String(Math.max(0, ...codigos) + 1).padStart(2, '0')}`;
  }

  private async revisarCorreo(correo: string, excluirId?: string) {
    const repetido = await this.repositorio.exists({ where: { correo: correo.trim().toLowerCase(), ...(excluirId ? { id: Not(excluirId) } : {}) } });
    if (repetido) throw new ConflictException({ message: 'Ese correo ya lo usa otra persona del personal.', campo: 'correo' });
  }

  async agregar(datos: Partial<Personal>) {
    await this.revisarCorreo(datos.correo!);
    return this.repositorio.save(this.repositorio.create({ ...datos, correo: datos.correo!.trim().toLowerCase(), codigo: await this.siguienteCodigo() }));
  }

  // Sirve para editar un legajo o para cambiar varios a la vez (rol o ausencia).
  async actualizar(ids: string[], cambios: Partial<Personal>) {
    if (cambios.correo) {
      if (ids.length > 1) throw new BadRequestException('El correo se cambia de a una persona.');
      await this.revisarCorreo(cambios.correo, ids[0]);
      cambios.correo = cambios.correo.trim().toLowerCase();
    }
    const personas = await this.repositorio.find({ where: { id: In(ids) } });
    personas.forEach((p) => Object.assign(p, cambios));
    return this.repositorio.save(personas);
  }

  async eliminar(ids: string[]) {
    const personas = await this.repositorio.find({ where: { id: In(ids) } });
    const conUsuario = personas.filter((p) => p.usuarioId);
    if (conUsuario.length) {
      throw new BadRequestException(`${conUsuario.map((p) => p.nombre).join(', ')} tiene usuario del portal: cargale una ausencia en lugar de eliminarlo.`);
    }
    await this.repositorio.remove(personas);
  }

  deUsuario(usuarioId: string) {
    return this.repositorio.findOne({ where: { usuarioId } });
  }

  // Quién firma un cambio hecho desde el panel: "Pedro Díaz (A01)".
  async firma(usuario: UsuarioAutenticado) {
    if (usuario.rol === Rol.ADMIN_PRINCIPAL) return `${DIRECCION.nombre} (${DIRECCION.codigo})`;
    const persona = await this.deUsuario(usuario.id);
    if (!persona) throw new ForbiddenException('Tu usuario no está vinculado a ninguna persona del personal.');
    return `${persona.nombre} (${persona.codigo})`;
  }

  datosParaPanel(persona: Personal) {
    return {
      id: persona.id,
      codigo: persona.codigo,
      nombre: persona.nombre,
      dni: persona.dni,
      rol: persona.rol,
      puesto: PUESTO_POR_ROL[persona.rol] ?? persona.rol,
      sector: persona.sector ?? persona.rol,
      correo: persona.correo,
      telefono: persona.telefono,
      interno: persona.telefono,
      dias: persona.dias,
      entrada: persona.entrada,
      salida: persona.salida,
      turno: `${persona.dias}, de ${persona.entrada} a ${persona.salida} h`,
      ingreso: String(persona.ingreso).slice(0, 10),
      ausencia: persona.ausencia,
      conPortal: Boolean(persona.usuarioId),
    };
  }
}
