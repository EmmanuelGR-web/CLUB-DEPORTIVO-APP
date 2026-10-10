import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
