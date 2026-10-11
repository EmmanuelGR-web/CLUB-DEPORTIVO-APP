// =====================================================================
// login.dto.ts
// -----------------------------------------------------------------------
// Un "DTO" (Data Transfer Object) define QUÉ datos esperamos recibir
// en una petición, y con QUÉ reglas de validación. NestJS valida esto
// automáticamente gracias al ValidationPipe global que configuramos
// en main.ts, así no hay que escribir "if" a mano para validar.
// =====================================================================

import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'socio@ejemplo.com' })
  @IsEmail({}, { message: 'Ingresá un correo electrónico válido.' })
  email: string;

  @ApiProperty({ example: 'contrasena123' })
  @IsString()
  @MinLength(1, { message: 'Ingresá tu contraseña.' })
  @MaxLength(72)
  contrasena: string;

  // "Mantener sesión iniciada": el pase dura 30 días en lugar de cerrarse
  // con el navegador.
  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  recordar?: boolean;
}
