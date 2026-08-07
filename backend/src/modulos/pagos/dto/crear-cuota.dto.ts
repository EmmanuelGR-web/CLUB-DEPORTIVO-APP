// =====================================================================
// crear-cuota.dto.ts
// -----------------------------------------------------------------------
// Datos necesarios para dar de alta un nuevo período de cuota social.
// Solo lo puede usar un admin (ver restricción de rol en el
// controlador), nunca un socio común.
// =====================================================================

import { IsDateString, IsNumber, IsPositive, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearCuotaDto {
  @ApiProperty({ example: '2026-08', description: 'Formato AAAA-MM' })
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'El período debe tener el formato AAAA-MM, ej: 2026-08',
  })
  periodo: string;

  @ApiProperty({ example: 15000 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto admite hasta 2 decimales' })
  @IsPositive({ message: 'El monto debe ser mayor a cero' })
  monto: number;

  @ApiProperty({ example: '2026-08-31' })
  @IsDateString()
  fechaVencimiento: string;
}
