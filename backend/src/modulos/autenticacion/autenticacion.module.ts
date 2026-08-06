// =====================================================================
// autenticacion.module.ts
// -----------------------------------------------------------------------
// Agrupa todas las piezas del módulo de autenticación: controlador,
// servicio y la estrategia JWT. También configura JwtModule con el
// secreto y tiempo de expiración leídos desde el .env.
// =====================================================================

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';
import { JwtStrategy } from './estrategias/jwt.strategy';
import { SociosModule } from '../socios/socios.module';

@Module({
  imports: [
    SociosModule, // necesitamos buscar socios por email para el login
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRETO'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRACION', '1d') },
      }),
    }),
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService, JwtStrategy],
  exports: [AutenticacionService],
})
export class AutenticacionModule {}
