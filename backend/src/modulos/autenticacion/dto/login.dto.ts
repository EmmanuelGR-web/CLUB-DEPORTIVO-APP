// =====================================================================
// login.dto.ts
// -----------------------------------------------------------------------
// Un "DTO" (Data Transfer Object) define QUÉ datos esperamos recibir
// en una petición, y con QUÉ reglas de validación. NestJS valida esto
// automáticamente gracias al ValidationPipe global que configuramos
// en main.ts, así no hay que escribir "if" a mano para validar.
// =====================================================================

import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'socio@ejemplo.com' })
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email: string;

  @ApiProperty({ example: 'contrasena123' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contrasena: string;
}
