// =====================================================================
// actualizar-estado-pago.dto.ts
// -----------------------------------------------------------------------
// Usado por el personal del club (administrativo o admin_principal)
// para confirmar o rechazar un pago que un socio declaró. Es una
// acción administrativa, nunca la ejecuta el propio socio.
// =====================================================================

import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoPago } from '../entidades/estado-pago.enum';

export class ActualizarEstadoPagoDto {
  @ApiProperty({ enum: EstadoPago, example: EstadoPago.APROBADO })
  @IsEnum(EstadoPago, { message: 'Estado inválido' })
  estado: EstadoPago;
}
