// =====================================================================
// admin.module.ts
// -----------------------------------------------------------------------
// Rutas exclusivas de la administración principal: el panel con la
// información económica (padrón completo con sus cuotas) y la gestión
// del personal del club. El resto de lo que usa este panel (fichas,
// baja de socios, canal interno) vive en /gestion.
// =====================================================================

import { BadRequestException, Body, Controller, Delete, Get, Injectable, Module, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsEmail, IsIn, IsObject, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength, ValidateIf, ValidateNested } from 'class-validator';
import { JwtAuthGuard } from '../../comun/guards/jwt-auth.guard';
import { RolesGuard } from '../../comun/guards/roles.guard';
import { Roles } from '../../comun/decoradores/roles.decorator';
import { Rol } from '../../comun/enums/rol.enum';
import { UsuarioActual, UsuarioAutenticado } from '../../comun/decoradores/usuario-actual.decorator';
import { SociosModule } from '../socios/socios.module';
import { SociosService } from '../socios/socios.service';
import { PerfilesModule } from '../perfiles/perfiles.module';
import { PerfilesService } from '../perfiles/perfiles.service';
import { PersonalModule } from '../personal/personal.module';
import { PersonalService } from '../personal/personal.service';
import { JornadasService, jornadaParaPanel } from '../personal/jornadas.service';
import { RegistroCambiosModule } from '../registro-cambios/registro-cambios.module';
import { RegistroCambiosService } from '../registro-cambios/registro-cambios.service';
import { GestionModule } from '../gestion/gestion.module';
import { GestionService } from '../gestion/gestion.service';
import { Ausencia } from '../personal/personal.entity';

const ROLES_PERSONAL = ['Administrativo', 'Tesorería', 'Recepción', 'Mantenimiento'];
const DIAS = ['Lunes a viernes', 'Lunes a sábado', 'Fines de semana'];
const MOTIVOS = ['Vacaciones', 'Licencia médica', 'Licencia personal', 'Suspensión'];

class AusenciaDto {
  @IsIn(MOTIVOS) motivo: Ausencia['motivo'];
  @IsDateString() desde: string;
  @IsDateString() hasta: string;
  @IsOptional() @IsString() @MaxLength(120) nota?: string;
}

class PersonalDto {
  @IsString() @MinLength(5, { message: 'Ingresá nombre y apellido.' }) @MaxLength(150) nombre: string;
  @Matches(/^\d{7,8}$/, { message: 'El DNI tiene 7 u 8 números.' }) dni: string;
  @IsIn(ROLES_PERSONAL) rol: string;
  @IsEmail({}, { message: 'Ingresá un correo válido.' }) correo: string;
  @IsOptional() @IsString() @MaxLength(40) telefono?: string;
  @IsIn(DIAS) dias: string;
  @Matches(/^\d{2}:\d{2}$/) entrada: string;
  @Matches(/^\d{2}:\d{2}$/) salida: string;
  @IsDateString() ingreso: string;
  @IsOptional() @ValidateIf((_, v) => v !== null) @ValidateNested() @Type(() => AusenciaDto) ausencia?: AusenciaDto | null;
}

class CambiosPersonalDto {
  @IsArray() @ArrayMinSize(1) @IsUUID('all', { each: true }) ids: string[];
  @IsObject() cambios: Partial<PersonalDto>;
}

class IdsDto {
  @IsArray() @ArrayMinSize(1) @IsUUID('all', { each: true }) ids: string[];
}

@Injectable()
export class AdminService {
  constructor(
    private readonly socios: SociosService,
    private readonly perfiles: PerfilesService,
    private readonly personal: PersonalService,
    private readonly jornadas: JornadasService,
    private readonly registro: RegistroCambiosService,
    private readonly gestion: GestionService,
  ) {}

  async panel(usuario: UsuarioAutenticado) {
    const socios = (await this.socios.listar()).filter((s) => s.rol === Rol.SOCIO && s.activo);
    // Perfil completo de cada socio, con su estado de cuenta, para la
    // facturación y el resumen económico.
    const perfiles = await this.perfiles.armarVarios(socios);
    perfiles.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));

    const [nomina, jornadas, registros, solicitudes, hilosInternos] = await Promise.all([
      this.personal.listar(),
      this.jornadas.todasDeHoy(),
      this.registro.listarTodos(),
      this.gestion.solicitudes(),
      this.gestion.internos(usuario),
    ]);
    return {
      perfiles,
      personal: nomina.map((p) => this.personal.datosParaPanel(p)),
      jornadas: Object.fromEntries(jornadas.map((j) => [j.personalId, jornadaParaPanel(j)])),
      registros,
      solicitudes,
      hilosInternos,
    };
  }

  private revisarHorario(datos: Partial<PersonalDto>) {
    if (datos.entrada && datos.salida && datos.salida <= datos.entrada) throw new BadRequestException('La salida tiene que ser después de la entrada.');
    if (datos.ausencia && datos.ausencia.hasta < datos.ausencia.desde) throw new BadRequestException('El último día no puede ser anterior al primero.');
  }

  async agregar(datos: PersonalDto) {
    this.revisarHorario(datos);
    return this.personal.datosParaPanel(await this.personal.agregar(datos));
  }

  async actualizar(ids: string[], pedidos: Partial<PersonalDto>) {
    // Solo se pueden tocar los datos del legajo: nunca el código ni el
    // usuario del portal vinculado.
    const campos = ['nombre', 'dni', 'rol', 'correo', 'telefono', 'dias', 'entrada', 'salida', 'ingreso', 'ausencia'] as const;
    const cambios = Object.fromEntries(Object.entries(pedidos).filter(([campo]) => (campos as readonly string[]).includes(campo))) as Partial<PersonalDto>;
    if (cambios.rol && !ROLES_PERSONAL.includes(cambios.rol)) throw new BadRequestException('Rol desconocido.');
    if (cambios.dias && !DIAS.includes(cambios.dias)) throw new BadRequestException('Días de trabajo desconocidos.');
    if (cambios.ausencia && (!MOTIVOS.includes(cambios.ausencia.motivo) || !cambios.ausencia.desde || !cambios.ausencia.hasta)) {
      throw new BadRequestException('Indicá el motivo y desde y hasta qué día.');
    }
    this.revisarHorario(cambios);
    return (await this.personal.actualizar(ids, cambios)).map((p) => this.personal.datosParaPanel(p));
  }

  eliminar(ids: string[]) {
    return this.personal.eliminar(ids);
  }
}

@ApiTags('Administración principal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN_PRINCIPAL)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('panel')
  @ApiOperation({ summary: 'Padrón con estado de cuenta, personal y jornadas de hoy, registro de cambios, solicitudes y canal interno' })
  panel(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.admin.panel(usuario);
  }

  @Post('personal')
  @ApiOperation({ summary: 'Suma una persona al personal (el legajo se asigna solo)' })
  agregar(@Body() datos: PersonalDto) {
    return this.admin.agregar(datos);
  }

  @Patch('personal')
  @ApiOperation({ summary: 'Edita un legajo o cambia el rol o la ausencia de varios a la vez' })
  actualizar(@Body() datos: CambiosPersonalDto) {
    return this.admin.actualizar(datos.ids, datos.cambios);
  }

  @Delete('personal')
  @ApiOperation({ summary: 'Elimina personas del personal (no a quien tiene usuario del portal)' })
  async eliminar(@Body() datos: IdsDto) {
    await this.admin.eliminar(datos.ids);
    return { ok: true };
  }
}

@Module({
  imports: [SociosModule, PerfilesModule, PersonalModule, RegistroCambiosModule, GestionModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
