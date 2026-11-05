import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';
import { JwtStrategy } from './estrategias/jwt.strategy';
import { SociosModule } from '../socios/socios.module';
import { RegistroCambiosModule } from '../registro-cambios/registro-cambios.module';
import { MensajesModule } from '../mensajes/mensajes.module';
import { PersonalModule } from '../personal/personal.module';

@Module({
  imports: [
    SociosModule,
    RegistroCambiosModule,
    MensajesModule,
    PersonalModule,
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
