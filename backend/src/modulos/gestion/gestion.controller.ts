// =====================================================================
// gestion.controller.ts
// -----------------------------------------------------------------------
// Rutas del panel del personal. Las usan el personal administrativo y
// la administración principal; dar de baja socios queda solo para la
// administración principal (se controla en el servicio).
// =====================================================================

import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../../comun/guards/jwt-auth.guard';
import { RolesGuard } from '../../comun/guards/roles.guard';
import { Roles } from '../../comun/decoradores/roles.decorator';
import { Rol } from '../../comun/enums/rol.enum';
import { UsuarioActual, UsuarioAutenticado } from '../../comun/decoradores/usuario-actual.decorator';
import { GestionService } from './gestion.service';
import { GuardarCambiosDto, MensajeDto } from '../mi-cuenta/dto/mi-cuenta.dto';
import { AltaPresencialDto } from './dto/alta-presencial.dto';

class ResolverDto {
  @IsIn(['Autorizado', 'Rechazado']) estado: 'Autorizado' | 'Rechazado';
  @IsOptional() @IsString() @MaxLength(300) motivo?: string;
}

class MensajeInternoDto extends MensajeDto {
  @IsOptional() @IsString() destino?: string;
}

class JornadaDto {
  @IsIn(['actividad', 'descanso', 'volver', 'salida', 'fin']) accion: 'actividad' | 'descanso' | 'volver' | 'salida' | 'fin';
}

@ApiTags('Gestión (personal del club)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMINISTRATIVO, Rol.ADMIN_PRINCIPAL)
@Controller('gestion')
export class GestionController {
  constructor(private readonly gestion: GestionService) {}

  @Get('panel')
  @ApiOperation({ summary: 'Todo lo que muestra el panel: padrón, solicitudes, mensajes, registro de cambios y canal interno' })
  panel(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.gestion.panel(usuario);
  }

  @Post('solicitudes/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Autoriza o rechaza una solicitud (alta, cambio de datos o comprobante) y le avisa al socio' })
  resolver(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id') id: string, @Body() datos: ResolverDto) {
    return this.gestion.resolverSolicitud(usuario, id, datos.estado, datos.motivo);
  }

  @Get('socios/:id')
  @ApiOperation({ summary: 'Ficha completa de un socio con sus movimientos e historial' })
  ficha(@Param('id', ParseUUIDPipe) id: string) {
    return this.gestion.ficha(id);
  }

  @Patch('socios/:id')
  @ApiOperation({ summary: 'Corrige datos o medio de pago de un socio (se aplica al instante y queda registrado)' })
  corregir(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string, @Body() datos: GuardarCambiosDto) {
    return this.gestion.corregir(usuario, id, datos.cambios, datos.seccion);
  }

  @Post('socios/:id/restablecer-contrasena')
  @HttpCode(200)
  @ApiOperation({ summary: 'La contraseña del socio pasa a ser su DNI' })
  restablecer(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return this.gestion.restablecerContrasena(usuario, id);
  }

  @Delete('socios/:id')
  @Roles(Rol.ADMIN_PRINCIPAL)
  @ApiOperation({ summary: '[Administración principal] Da de baja a un socio del padrón' })
  baja(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    return this.gestion.darDeBaja(usuario, id);
  }

  @Post('socios')
  @ApiOperation({ summary: 'Alta presencial: el socio queda activo con su DNI como contraseña inicial' })
  alta(@UsuarioActual() usuario: UsuarioAutenticado, @Body() datos: AltaPresencialDto) {
    return this.gestion.altaPresencial(usuario, datos);
  }

  @Post('conversaciones/:id/mensajes')
  @ApiOperation({ summary: 'Responde a un socio como administración' })
  responderSocio(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string, @Body() datos: MensajeDto) {
    return this.gestion.responderSocio(usuario, id, datos);
  }

  @Post('interno')
  @ApiOperation({ summary: 'Nuevo mensaje del canal interno (la dirección elige destinatario o "todos")' })
  nuevoInterno(@UsuarioActual() usuario: UsuarioAutenticado, @Body() datos: MensajeInternoDto) {
    const { destino, ...mensaje } = datos;
    return this.gestion.nuevoInterno(usuario, mensaje, destino);
  }

  @Post('interno/:id/mensajes')
  @ApiOperation({ summary: 'Responde en el canal interno' })
  responderInterno(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string, @Body() datos: MensajeDto) {
    return this.gestion.responderInterno(usuario, id, datos);
  }

  @Post('interno/:id/leido')
  @HttpCode(204)
  async leidoInterno(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    await this.gestion.leidoInterno(usuario, id);
  }

  @Post('jornada')
  @HttpCode(200)
  @Roles(Rol.ADMINISTRATIVO)
  @ApiOperation({ summary: 'Jornada del empleado: actividad, descanso, volver, salida o fin' })
  jornada(@UsuarioActual() usuario: UsuarioAutenticado, @Body() datos: JornadaDto) {
    return this.gestion.jornada(usuario, datos.accion);
  }
}
