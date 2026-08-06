// =====================================================================
// jwt-auth.guard.ts
// -----------------------------------------------------------------------
// Un "Guard" en NestJS es como un portero: se ejecuta ANTES de que la
// petición llegue al controlador, y decide si la deja pasar o no.
//
// Este guard en particular usa la estrategia JWT (ver
// modulos/autenticacion/estrategias/jwt.strategy.ts) para verificar
// que el usuario mandó un token válido en el header:
//   Authorization: Bearer <token>
//
// Si el token es válido, deja pasar la petición y además "engancha"
// los datos del usuario logueado en request.usuario, para que el
// controlador sepa quién está haciendo el pedido.
// =====================================================================

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
