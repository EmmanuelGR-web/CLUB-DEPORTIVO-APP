// =====================================================================
// jwt.strategy.ts
// -----------------------------------------------------------------------
// Define CÓMO se valida un token JWT que llega en cada petición.
// Passport llama automáticamente al método validate() con el
// contenido que venía "adentro" del token (el payload), y lo que
// devolvamos acá es lo que va a terminar en request.usuario.
// =====================================================================

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// Forma de los datos que guardamos "adentro" del token al hacer login.
export interface CargaUtilJwt {
  sub: string; // id del usuario
  email: string;
  rol: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // rechaza tokens vencidos automáticamente
      secretOrKey: config.get<string>('JWT_SECRETO') ?? 'secreto_de_desarrollo',
    });
  }

  // Este método se ejecuta automáticamente después de que Passport
  // verifica que la firma del token es válida y no está vencido.
  async validate(cargaUtil: CargaUtilJwt) {
    return {
      id: cargaUtil.sub,
      email: cargaUtil.email,
      rol: cargaUtil.rol,
    };
  }
}
