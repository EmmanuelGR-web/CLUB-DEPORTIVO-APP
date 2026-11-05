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

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  recordar?: boolean;
}
