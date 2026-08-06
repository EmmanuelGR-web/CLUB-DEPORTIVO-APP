// =====================================================================
// socios.service.ts
// -----------------------------------------------------------------------
// Lógica de negocio relacionada a los socios: buscarlos, actualizar
// sus datos personales (sin tocar el número de socio) y determinar
// su categoría según antigüedad.
//
// Principio SOLID aplicado: Dependency Inversion. Este servicio no
// sabe CÓMO se guardan los datos en disco (postgres, otra base, etc),
// solo depende de la interfaz "Repository<Socio>" que le da TypeORM.
// Si el día de mañana se cambia el motor de base de datos, este
// servicio no debería necesitar cambios.
// =====================================================================

import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Socio } from './entidades/socio.entity';
import { CategoriaSocio } from './entidades/categoria-socio.entity';
import { ActualizarSocioDto } from './dto/actualizar-socio.dto';
import { generarCodigoBarras } from '../../comun/utilidades/codigo-barras.util';

@Injectable()
export class SociosService {
  constructor(
    @InjectRepository(Socio)
    private readonly repositorioSocios: Repository<Socio>,
    @InjectRepository(CategoriaSocio)
    private readonly repositorioCategorias: Repository<CategoriaSocio>,
  ) {}

  // Usado por el módulo de autenticación: trae también el hash de
  // contraseña (que normalmente está oculto) porque acá sí lo
  // necesitamos para comparar contra el login.
  async buscarPorEmailConContrasena(email: string) {
    return this.repositorioSocios
      .createQueryBuilder('socio')
      .addSelect('socio.contrasenaHash')
      .where('socio.email = :email', { email })
      .getOne();
  }

  async buscarPorId(id: string): Promise<Socio> {
    const socio = await this.repositorioSocios.findOne({ where: { id } });
    if (!socio) {
      throw new NotFoundException('Socio no encontrado');
    }
    return socio;
  }

  // Actualiza SOLO los datos personales permitidos. El idSocio nunca
  // se toca acá porque ni siquiera está definido en ActualizarSocioDto.
  async actualizarDatosPersonales(
    idUsuarioAutenticado: string,
    idSocioAModificar: string,
    datosNuevos: ActualizarSocioDto,
  ): Promise<Socio> {
    // Regla de seguridad extra: un socio solo puede modificar SUS
    // PROPIOS datos, nunca los de otro socio (salvo que sea admin,
    // lo cual se controla en el controlador con @Roles()).
    if (idUsuarioAutenticado !== idSocioAModificar) {
      throw new ForbiddenException('No podés modificar los datos de otro socio');
    }

    const socio = await this.buscarPorId(idSocioAModificar);
    Object.assign(socio, datosNuevos);
    return this.repositorioSocios.save(socio);
  }

  // Crea un socio nuevo. La contraseña ya llega ENCRIPTADA (el hash lo
  // calcula AutenticacionService, que es responsable de todo lo
  // relacionado a seguridad de credenciales). Este servicio solo se
  // encarga de guardar los datos correctamente.
  async crear(datos: {
    nombre: string;
    apellido: string;
    email: string;
    contrasenaHash: string;
    telefono?: string;
  }): Promise<Socio> {
    const socioExistente = await this.repositorioSocios.findOne({
      where: { email: datos.email },
    });
    if (socioExistente) {
      throw new ConflictException('Ya existe un socio registrado con ese email');
    }

    // Todo socio nuevo arranca en la categoría "Bronce" (0 años de
    // antigüedad), que se recalcula automáticamente con el tiempo.
    const categoriaInicial = await this.repositorioCategorias.findOne({
      where: { aniosMinimos: 0 },
    });

    const socioNuevo = this.repositorioSocios.create({
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      contrasenaHash: datos.contrasenaHash,
      telefono: datos.telefono ?? null,
      fechaAlta: new Date(),
      categoria: categoriaInicial,
    });

    // idSocio NO se define acá: lo asigna automáticamente la secuencia
    // de PostgreSQL (secuencia_id_socio) que armamos en la migración.
    return this.repositorioSocios.save(socioNuevo);
  }

  // Calcula y asigna la categoría (oro/plata/bronce) de un socio
  // según sus años de antigüedad, comparando contra los rangos
  // definidos en la tabla categorias_socio. Este método SÍ persiste
  // el cambio en la base (útil para un proceso administrativo que
  // recalcule categorías de forma masiva, por ejemplo una vez por mes).
  async actualizarCategoriaPorAntiguedad(socio: Socio): Promise<Socio> {
    const anios = socio.calcularAntiguedadEnAnios();
    socio.categoria = await this.buscarCategoriaPorAnios(anios);
    return this.repositorioSocios.save(socio);
  }

  // Busca la categoría (oro/plata/bronce) que corresponde a una
  // cantidad de años determinada, comparando contra los rangos
  // configurados en la tabla categorias_socio.
  private async buscarCategoriaPorAnios(anios: number): Promise<CategoriaSocio | null> {
    return this.repositorioCategorias
      .createQueryBuilder('categoria')
      .where('categoria.aniosMinimos <= :anios', { anios })
      .andWhere('(categoria.aniosMaximos IS NULL OR categoria.aniosMaximos >= :anios)', { anios })
      .getOne();
  }

  // Guarda la URL de la foto de carnet que ya fue subida a Supabase
  // Storage. Este servicio NO sabe nada de cómo se subió el archivo
  // (esa responsabilidad es 100% de AlmacenamientoService) — solo
  // actualiza la columna correspondiente.
  async actualizarFotoCarnet(idSocio: string, nuevaUrl: string): Promise<Socio> {
    const socio = await this.buscarPorId(idSocio);
    socio.fotoCarnetUrl = nuevaUrl;
    return this.repositorioSocios.save(socio);
  }

  // Arma toda la información del carnet digital de un socio: sus
  // datos básicos, la antigüedad y categoría CALCULADAS AL MOMENTO
  // (no depende de que alguien haya "recalculado" antes, siempre está
  // al día), y el código de barras único para ese socio.
  //
  // Importante: esto NO escribe en la base de datos (es una consulta
  // de solo lectura), así que se puede llamar tantas veces como haga
  // falta sin generar carga extra ni afectar la auditoría.
  async obtenerCarnet(idInterno: string) {
    const socio = await this.buscarPorId(idInterno);
    const antiguedadAnios = socio.calcularAntiguedadEnAnios();

    // La categoría "en vivo" puede diferir de la guardada en la base
    // si pasó tiempo desde el último recálculo (ej: un socio cumplió
    // años de antigüedad hoy). Para el carnet siempre mostramos la
    // categoría real y actualizada, calculándola acá mismo.
    const categoriaActual = await this.buscarCategoriaPorAnios(antiguedadAnios);

    return {
      idSocio: socio.idSocio.toString(),
      nombreCompleto: `${socio.nombre} ${socio.apellido}`,
      fotoCarnetUrl: socio.fotoCarnetUrl,
      antiguedadAnios,
      categoria: categoriaActual?.nombre ?? 'Sin categoría',
      socioActivo: socio.activo,
      codigoBarras: generarCodigoBarras(socio.idSocio),
    };
  }
}
