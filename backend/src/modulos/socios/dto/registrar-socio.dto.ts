// =====================================================================
// registrar-socio.dto.ts
// -----------------------------------------------------------------------
// Define los datos que se piden para que una persona cree su cuenta
// de socio por sí misma, desde el celular o la computadora, sin
// necesidad de ir presencialmente al club (tal como pediste en la
// especificación original del proyecto).
//
// Notar que acá SÍ pedimos "contrasena" en texto plano (es lo normal:
// el usuario la tipea así), pero nunca se guarda así en la base.
// El SociosService se encarga de convertirla en un hash con bcrypt
// antes de guardar nada.
// =====================================================================

import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegistrarSocioDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @MaxLength(100)
  apellido: string;

  @ApiProperty({ example: 'juan.perez@ejemplo.com' })
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email: string;

  @ApiProperty({ example: 'contrasena123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contrasena: string;

  @ApiPropertyOptional({ example: '3811234567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;
}
