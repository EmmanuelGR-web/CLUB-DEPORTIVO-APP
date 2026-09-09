// =====================================================================
// pagos.controller.ts
// -----------------------------------------------------------------------
// Fijate el patrón de seguridad en cada endpoint:
//
//   - Los socios pueden VER cuotas, PAGAR y ver SU PROPIO historial.
//   - Solo el personal del club (@Roles(ADMINISTRATIVO, ADMIN_PRINCIPAL))
//     puede crear cuotas nuevas y confirmar/rechazar pagos.
//
// Esto pone en código, de forma verificable, la regla que pediste:
// "el socio no puede ver ni gestionar los movimientos económicos
// principales del club".
// =====================================================================

import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../comun/guards/jwt-auth.guard';
import { RolesGuard } from '../../comun/guards/roles.guard';
import { Roles } from '../../comun/decoradores/roles.decorator';
import { Rol } from '../../comun/enums/rol.enum';
import { UsuarioActual, UsuarioAutenticado } from '../../comun/decoradores/usuario-actual.decorator';
import { PagosService } from './pagos.service';
import { CrearCuotaDto } from './dto/crear-cuota.dto';
import { ActualizarCuotaDto } from './dto/actualizar-cuota.dto';
import { RegistrarPagoDto } from './dto/registrar-pago.dto';
import { ActualizarEstadoPagoDto } from './dto/actualizar-estado-pago.dto';

@ApiTags('Pagos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  // --- Endpoints para cualquier socio autenticado ---

  @Get('cuotas')
  @ApiOperation({ summary: 'Lista todos los períodos de cuota disponibles' })
  async listarCuotas() {
    return this.pagosService.listarCuotas();
  }

  @Post('pagos')
  @ApiOperation({ summary: 'Registra el pago de una cuota (queda pendiente de confirmación)' })
  async registrarPago(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body() datos: RegistrarPagoDto,
  ) {
    return this.pagosService.registrarPago(usuario.id, datos);
  }

  @Get('mis-pagos')
  @ApiOperation({ summary: 'Historial de pagos del socio logueado' })
  async listarMisPagos(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.pagosService.listarPagosDeSocio(usuario.id);
  }

  @Get('mi-estado-de-cuenta')
  @ApiOperation({ summary: 'Muestra qué cuotas tiene pagadas y cuáles le faltan al socio' })
  async obtenerMiEstadoDeCuenta(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.pagosService.obtenerEstadoDeCuenta(usuario.id);
  }

  // Sin @Roles(): la deja abierta a cualquier usuario autenticado
  // (socio o personal del club), porque la restricción real no es
  // por rol sino por PROPIEDAD del pago. Esa comprobación fina
  // (¿es el dueño? ¿es personal del club?) la hace el service.
  @Get('pagos/:id/comprobante')
  @ApiOperation({ summary: 'Obtiene el cupón/comprobante de un pago ya aprobado' })
  async obtenerComprobante(
    @Param('id') idPago: string,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.pagosService.obtenerComprobante(idPago, usuario);
  }

  // --- Endpoints exclusivos del personal del club ---
  // Nota: ADMINISTRATIVO puede operar el día a día (crear cuotas,
  // confirmar pagos individuales); el acceso a REPORTES agregados
  // de movimientos económicos del club queda reservado únicamente
  // a ADMIN_PRINCIPAL (eso se implementa en una fase posterior,
  // cuando se agregue el panel de reportes).

  @Post('cuotas')
  @Roles(Rol.ADMINISTRATIVO, Rol.ADMIN_PRINCIPAL)
  @ApiOperation({ summary: '[Personal del club] Crea un nuevo período de cuota social' })
  async crearCuota(@Body() datos: CrearCuotaDto) {
    return this.pagosService.crearCuota(datos);
  }

  @Patch('cuotas/:id')
  @Roles(Rol.ADMINISTRATIVO, Rol.ADMIN_PRINCIPAL)
  @ApiOperation({
    summary: '[Personal del club] Corrige el monto o la fecha de vencimiento de una cuota',
  })
  async actualizarCuota(@Param('id') idCuota: string, @Body() datos: ActualizarCuotaDto) {
    return this.pagosService.actualizarCuota(idCuota, datos);
  }

  @Get('pagos/pendientes')
  @Roles(Rol.ADMINISTRATIVO, Rol.ADMIN_PRINCIPAL)
  @ApiOperation({ summary: '[Personal del club] Lista los pagos que esperan confirmación' })
  async listarPagosPendientes() {
    return this.pagosService.listarPagosPendientes();
  }

  @Get('pagos/:id')
  @Roles(Rol.ADMINISTRATIVO, Rol.ADMIN_PRINCIPAL)
  @ApiOperation({
    summary: '[Personal del club] Ve el detalle completo de un pago (medio de pago, comprobante, socio y cuota)',
  })
  async obtenerPago(@Param('id') idPago: string) {
    return this.pagosService.obtenerPagoPorId(idPago);
  }

  @Patch('pagos/:id/estado')
  @Roles(Rol.ADMINISTRATIVO, Rol.ADMIN_PRINCIPAL)
  @ApiOperation({
    summary:
      '[Personal del club] Confirma, rechaza o corrige el estado de un pago declarado. Al aprobarlo se genera automáticamente el comprobante.',
  })
  async actualizarEstadoPago(@Param('id') idPago: string, @Body() datos: ActualizarEstadoPagoDto) {
    return this.pagosService.actualizarEstadoPago(idPago, datos.estado, datos.observacion);
  }
}
