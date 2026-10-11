// =====================================================================
// jwt.strategy.ts
// -----------------------------------------------------------------------
// Define CÓMO se valida el pase de sesión que llega en cada petición.
// Se lee de la cookie de sesión (o del header Authorization, para probar
// la API desde Swagger). Passport verifica la firma y el vencimiento, y
// después validate() revisa en la base que la cuenta siga habilitada y
// que el pase no sea de antes de un cambio de contraseña.
// =====================================================================

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { SociosService } from '../../socios/socios.service';
import { PersonalService, ausenciaVigente } from '../../personal/personal.service';
import { Rol } from '../../../comun/enums/rol.enum';
import { COOKIE_SESION, CargaUtilJwt } from '../sesion';

export type { CargaUtilJwt } from '../sesion';

const desdeCookie = (peticion: Request) => peticion?.cookies?.[COOKIE_SESION] ?? null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly socios: SociosService,
    private readonly personal: PersonalService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([desdeCookie, ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false, // rechaza pases vencidos automáticamente
      // Sin secreto configurado el servidor no arranca: nunca se firma con
      // un valor conocido.
      secretOrKey: config.getOrThrow<string>('JWT_SECRETO'),
      algorithms: ['HS256'],
    });
  }

  async validate(carga: CargaUtilJwt) {
    const socio = await this.socios.datosDeSesion(carga.sub);
    if (!socio || !socio.activo || socio.versionSesion !== (carga.ver ?? 0)) {
      throw new UnauthorizedException('La sesión ya no es válida. Volvé a ingresar.');
    }
    // Si al personal le cargan una licencia mientras tiene la sesión
    // abierta, deja de tener acceso en el acto.
    if (socio.rol === Rol.ADMINISTRATIVO) {
      const persona = await this.personal.deUsuario(socio.id);
      if (persona && ausenciaVigente(persona)) throw new UnauthorizedException('Tu acceso está suspendido mientras dure la ausencia.');
    }
    return { id: socio.id, email: socio.email, rol: socio.rol, recordar: Boolean(carga.rec) };
  }
}
