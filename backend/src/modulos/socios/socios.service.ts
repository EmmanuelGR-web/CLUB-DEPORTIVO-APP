// =====================================================================
// socios.service.ts
// -----------------------------------------------------------------------
// Acceso a la tabla de socios: buscar, crear y revisar duplicados.
// Las reglas de qué cambios necesitan aprobación viven en
// MiCuentaService (y en el panel del personal, más adelante).
// =====================================================================

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import { EstadoSocio, MedioPagoSocio, Socio } from './entidades/socio.entity';
import { CategoriaSocio } from './entidades/categoria-socio.entity';
import { Rol } from '../../comun/enums/rol.enum';
import { aniosEntre, categoriaPorAntiguedad } from '../../comun/utilidades/cuotas.util';

export const normalizarEmail = (email: string) => email.trim().toLowerCase();
export const normalizarDni = (dni: string) => dni.replace(/\D/g, '');

export interface DatosSocioNuevo {
  nombre: string;
  apellido: string;
  email: string;
  contrasenaHash: string;
  dni?: string | null;
  fechaNacimiento?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  foto?: string | null;
  medioPago?: MedioPagoSocio;
  lecturaIA?: Record<string, unknown> | null;
  estado?: EstadoSocio;
  rol?: Rol;
  fechaAlta?: string;
  debeCambiarContrasena?: boolean;
}

@Injectable()
export class SociosService {
  constructor(
    @InjectRepository(Socio) private readonly repositorioSocios: Repository<Socio>,
    @InjectRepository(CategoriaSocio) private readonly repositorioCategorias: Repository<CategoriaSocio>,
  ) {}

  buscarPorEmailConContrasena(email: string) {
    return this.repositorioSocios
      .createQueryBuilder('socio')
      .addSelect('socio.contrasenaHash')
      .where('socio.email = :email', { email: normalizarEmail(email) })
      .getOne();
  }

  async buscarPorIdConContrasena(id: string) {
    const socio = await this.repositorioSocios
      .createQueryBuilder('socio')
      .addSelect('socio.contrasenaHash')
      .where('socio.id = :id', { id })
      .getOne();
    if (!socio) throw new NotFoundException('No encontramos la cuenta.');
    return socio;
  }

  async buscarPorId(id: string): Promise<Socio> {
    const socio = await this.repositorioSocios.findOne({ where: { id } });
    if (!socio) throw new NotFoundException('No encontramos la cuenta.');
    return socio;
  }

  // Devuelve qué dato ya usa otra cuenta: 'email', 'dni' o null.
  async buscarDuplicado({ email, dni }: { email?: string | null; dni?: string | null }, excluirId?: string) {
    const excluir = excluirId ? { id: Not(excluirId) } : {};
    if (email && (await this.repositorioSocios.exists({ where: { email: normalizarEmail(email), ...excluir } }))) return 'email';
    if (dni && (await this.repositorioSocios.exists({ where: { dni: normalizarDni(dni), ...excluir } }))) return 'dni';
    return null;
  }

  async crear(datos: DatosSocioNuevo, gestor?: EntityManager): Promise<Socio> {
    const duplicado = await this.buscarDuplicado(datos);
    if (duplicado) {
      throw new ConflictException({
        message: `Ya hay un socio registrado con ese ${duplicado === 'email' ? 'correo' : 'DNI'}.`,
        duplicado,
      });
    }

    const repositorio = gestor?.getRepository(Socio) ?? this.repositorioSocios;
    const fechaAlta = datos.fechaAlta ?? new Date().toISOString().slice(0, 10);
    const socio = repositorio.create({
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      email: normalizarEmail(datos.email),
      contrasenaHash: datos.contrasenaHash,
      dni: datos.dni ? normalizarDni(datos.dni) : null,
      fechaNacimiento: datos.fechaNacimiento || null,
      direccion: datos.direccion?.trim() || null,
      telefono: datos.telefono?.trim() || null,
      foto: datos.foto ?? null,
      fotoActualizada: datos.foto ? new Date() : null,
      medioPago: datos.medioPago ?? { tipo: 'efectivo', debitoAutomatico: false },
      lecturaIA: datos.lecturaIA ?? null,
      estado: datos.estado ?? 'Activo',
      rol: datos.rol ?? Rol.SOCIO,
      fechaAlta,
      debeCambiarContrasena: datos.debeCambiarContrasena ?? false,
      categoria: await this.categoriaPara(new Date(`${fechaAlta}T12:00:00`)),
    });
    const guardado = await repositorio.save(socio);
    // id_socio lo completa la secuencia de la base: se vuelve a leer.
    return repositorio.findOneOrFail({ where: { id: guardado.id } });
  }

  guardar(socio: Socio, gestor?: EntityManager) {
    return (gestor?.getRepository(Socio) ?? this.repositorioSocios).save(socio);
  }

  // Mantiene categoria_id al día para los listados del personal.
  async categoriaPara(fechaAlta: Date, hoy = new Date()) {
    const nombre = categoriaPorAntiguedad(aniosEntre(fechaAlta, hoy));
    return this.repositorioCategorias.findOne({ where: { nombre } });
  }
}
