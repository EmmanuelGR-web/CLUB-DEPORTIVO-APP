// =====================================================================
// autenticacion.controller.ts
// -----------------------------------------------------------------------
// Define las RUTAS HTTP relacionadas al login. Este controlador es
// "delgado" a propósito: no tiene lógica de negocio, solo recibe la
// petición, la valida (gracias al DTO) y le pasa el trabajo al
// AutenticacionService. Lo único que hace por su cuenta es guardar o
// borrar la cookie de sesión.
// =====================================================================

import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AutenticacionService } from './autenticacion.service';
import { LoginDto } from './dto/login.dto';
import { RegistrarSocioDto } from '../socios/dto/registrar-socio.dto';
import { JwtOpcionalGuard } from '../../comun/guards/jwt-auth.guard';
import { UsuarioActual, UsuarioAutenticado } from '../../comun/decoradores/usuario-actual.decorator';
import { borrarCookieSesion, guardarCookieSesion } from './sesion';

@ApiTags('Autenticación')
@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  // Límite por red, además del bloqueo por cuenta: frena a quien prueba
  // contraseñas contra muchos correos distintos.
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ general: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Inicia sesión con email y contraseña; el pase queda en una cookie httpOnly' })
  async login(@Body() datosLogin: LoginDto, @Res({ passthrough: true }) respuesta: Response) {
    const recordar = Boolean(datosLogin.recordar);
    const { token, usuario } = await this.autenticacionService.iniciarSesion(datosLogin.email, datosLogin.contrasena, recordar);
    guardarCookieSesion(respuesta, token, recordar);
    return { usuario };
  }

  @Get('sesion')
  @UseGuards(JwtOpcionalGuard)
  @ApiOperation({ summary: 'Datos del usuario de la sesión abierta, o null si no hay sesión' })
  async sesion(@UsuarioActual() usuario: UsuarioAutenticado | null) {
    return { usuario: usuario ? await this.autenticacionService.sesionActual(usuario.id) : null };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cierra la sesión en este navegador' })
  logout(@Res({ passthrough: true }) respuesta: Response) {
    borrarCookieSesion(respuesta);
    return { ok: true };
  }

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ general: { limit: 10, ttl: 10 * 60_000 } })
  @ApiOperation({
    summary: 'Alta online de un socio: queda en validación hasta que el personal revisa sus datos',
  })
  async registro(@Body() datosRegistro: RegistrarSocioDto) {
    return this.autenticacionService.registrarSocio(datosRegistro);
  }
}
