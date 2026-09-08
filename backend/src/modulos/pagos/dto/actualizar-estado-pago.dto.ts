// =====================================================================
// actualizar-estado-pago.dto.ts
// -----------------------------------------------------------------------
// Usado por el personal del club (administrativo o admin_principal)
// para confirmar o rechazar un pago que un socio declaró. Es una
// acción administrativa, nunca la ejecuta el propio socio.
// =====================================================================

import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoPago } from '../entidades/estado-pago.enum';

export class ActualizarEstadoPagoDto {
  @ApiProperty({ enum: EstadoPago, example: EstadoPago.APROBADO })
  @IsEnum(EstadoPago, { message: 'Estado inválido' })
  estado: EstadoPago;

  // Opcional: motivo del rechazo, o aclaración de por qué se corrigió
  // un estado que estaba mal cargado (ej: "se había marcado aprobado
  // por error, el comprobante correspondía a otra cuota"). Queda
  // visible para el socio en su historial de pagos.
  @ApiPropertyOptional({ example: 'Comprobante ilegible, se pide reenviar' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  observacion?: string;
}
