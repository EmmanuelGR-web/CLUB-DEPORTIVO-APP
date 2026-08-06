// =====================================================================
// socios.controller.ts
// -----------------------------------------------------------------------
// Endpoints relacionados a los socios. Notar el patrón que se va a
// repetir en TODOS los controladores protegidos del proyecto:
//
//   @UseGuards(JwtAuthGuard, RolesGuard)
//
// Primero JwtAuthGuard verifica que el token sea válido (que el
// usuario esté logueado), y RECIÉN DESPUÉS RolesGuard verifica que
// tenga el rol necesario. El orden importa: no tiene sentido revisar
// el rol de alguien que ni siquiera mandó un token válido.
// =====================================================================

import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../comun/guards/jwt-auth.guard';
import { UsuarioActual, UsuarioAutenticado } from '../../comun/decoradores/usuario-actual.decorator';
import { SociosService } from './socios.service';
import { ActualizarSocioDto } from './dto/actualizar-socio.dto';

@ApiTags('Socios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('socios')
export class SociosController {
  constructor(private readonly sociosService: SociosService) {}

  // El propio socio consulta sus datos (usa el id que viene del token,
  // no un id cualquiera de la URL, así nadie puede "espiar" a otro
  // socio con solo cambiar un número en la petición).
  @Get('mi-perfil')
  async obtenerMiPerfil(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.sociosService.buscarPorId(usuario.id);
  }

  @Patch('mi-perfil')
  async actualizarMiPerfil(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body() datosNuevos: ActualizarSocioDto,
  ) {
    return this.sociosService.actualizarDatosPersonales(usuario.id, usuario.id, datosNuevos);
  }

  // Devuelve todo lo necesario para mostrar el carnet digital del
  // socio logueado: antigüedad, categoría actualizada al día de hoy,
  // y el código de barras único para escanear en el club.
  @Get('mi-carnet')
  @ApiOperation({
    summary: 'Obtiene los datos del carnet digital: categoría, antigüedad y código de barras',
  })
  async obtenerMiCarnet(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.sociosService.obtenerCarnet(usuario.id);
  }
}
