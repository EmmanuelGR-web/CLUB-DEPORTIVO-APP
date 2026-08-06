// =====================================================================
// autenticacion.controller.ts
// -----------------------------------------------------------------------
// Define las RUTAS HTTP relacionadas al login. Este controlador es
// "delgado" a propósito: no tiene lógica de negocio, solo recibe la
// petición, la valida (gracias al DTO) y le pasa el trabajo al
// AutenticacionService.
// =====================================================================

import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AutenticacionService } from './autenticacion.service';
import { LoginDto } from './dto/login.dto';
import { RegistrarSocioDto } from '../socios/dto/registrar-socio.dto';

@ApiTags('Autenticación')
@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicia sesión con email y contraseña, devuelve un token JWT' })
  async login(@Body() datosLogin: LoginDto) {
    return this.autenticacionService.iniciarSesion(datosLogin.email, datosLogin.contrasena);
  }

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crea una cuenta de socio nueva (alta 100% online) y devuelve el token de acceso',
  })
  async registro(@Body() datosRegistro: RegistrarSocioDto) {
    return this.autenticacionService.registrarSocio(datosRegistro);
  }
}
