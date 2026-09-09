// =====================================================================
// actualizar-cuota.dto.ts
// -----------------------------------------------------------------------
// Permite corregir una cuota ya creada: el monto (ej: error de tipeo,
// ajuste de precio) o la fecha de vencimiento. A propósito NO se
// puede modificar el "periodo" acá: ese es el identificador legible
// de la cuota (ej: "2026-08") y cambiarlo sería, en la práctica,
// convertirla en otra cuota distinta. Si el periodo está mal, lo
// correcto es no usar esta cuota y crear una nueva.
//
// Ambos campos son opcionales: se puede mandar solo el que se quiera
// corregir, sin obligar a repetir el otro.
// =====================================================================

import { IsDateString, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ActualizarCuotaDto {
  @ApiPropertyOptional({ example: 16000, description: 'Nuevo monto de la cuota' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto admite hasta 2 decimales' })
  @IsPositive({ message: 'El monto debe ser mayor a cero' })
  monto?: number;

  @ApiPropertyOptional({ example: '2026-09-30' })
  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;
}
