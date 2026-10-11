// =====================================================================
// mi-cuenta.controller.ts
// -----------------------------------------------------------------------
// Todo lo que el socio hace desde su panel. El perfil se devuelve
// completo (datos, carnet y estado de cuenta) para que el panel se
// actualice con un solo pedido cada pocos segundos.
// =====================================================================

import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../comun/guards/jwt-auth.guard';
import { UsuarioActual, UsuarioAutenticado } from '../../comun/decoradores/usuario-actual.decorator';
import { MiCuentaService } from './mi-cuenta.service';
import { AutenticacionService } from '../autenticacion/autenticacion.service';
import { guardarCookieSesion } from '../autenticacion/sesion';
import { CambiarContrasenaDto, GuardarCambiosDto, InformarPagoDto, MensajeDto } from './dto/mi-cuenta.dto';

@ApiTags('Mi cuenta (socio)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mi-cuenta')
export class MiCuentaController {
  constructor(
    private readonly miCuenta: MiCuentaService,
    private readonly autenticacion: AutenticacionService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Perfil completo del socio: datos, categoría, carnet y estado de cuenta' })
  perfil(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.miCuenta.perfil(usuario.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Guarda cambios. Nombre, DNI y nacimiento quedan pendientes de aprobación' })
  guardar(@UsuarioActual() usuario: UsuarioAutenticado, @Body() datos: GuardarCambiosDto) {
    return this.miCuenta.guardarCambios(usuario.id, datos.cambios, datos.seccion);
  }

  @Get('cambios')
  @ApiOperation({ summary: 'Historial de cambios de la cuenta' })
  cambios(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.miCuenta.historial(usuario.id);
  }

  @Post('contrasena')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cambia la contraseña verificando la actual' })
  async contrasena(@UsuarioActual() usuario: UsuarioAutenticado, @Body() datos: CambiarContrasenaDto, @Res({ passthrough: true }) respuesta: Response) {
    const socio = await this.miCuenta.cambiarContrasena(usuario.id, datos.actual, datos.nueva);
    // Las demás sesiones se cerraron; esta sigue con un pase nuevo.
    guardarCookieSesion(respuesta, this.autenticacion.emitirPase(socio, Boolean(usuario.recordar)), Boolean(usuario.recordar));
    return { ok: true };
  }

  @Post('pagos')
  @ApiOperation({ summary: 'Informa el pago de una cuota con su comprobante' })
  informarPago(@UsuarioActual() usuario: UsuarioAutenticado, @Body() datos: InformarPagoDto) {
    return this.miCuenta.informarPago(usuario.id, datos);
  }

  @Get('hilos')
  @ApiOperation({ summary: 'Bandeja de entrada del socio' })
  hilos(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.miCuenta.hilos(usuario.id);
  }

  @Post('hilos')
  @ApiOperation({ summary: 'Nuevo mensaje a administración' })
  nuevoHilo(@UsuarioActual() usuario: UsuarioAutenticado, @Body() datos: MensajeDto) {
    return this.miCuenta.nuevoHilo(usuario.id, datos);
  }

  @Post('hilos/:id/mensajes')
  @ApiOperation({ summary: 'Responde una conversación' })
  responder(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string, @Body() datos: MensajeDto) {
    return this.miCuenta.responder(usuario.id, id, datos);
  }

  @Post('hilos/:id/leido')
  @HttpCode(204)
  @ApiOperation({ summary: 'Marca una conversación como leída' })
  async leido(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string) {
    await this.miCuenta.marcarLeido(usuario.id, id);
  }
}
