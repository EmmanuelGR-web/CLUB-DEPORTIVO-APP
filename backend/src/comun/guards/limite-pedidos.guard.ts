// =====================================================================
// limite-pedidos.guard.ts
// -----------------------------------------------------------------------
// Limita cuántos pedidos puede hacer cada red por minuto (rate limiting).
// Frena a quien intenta adivinar contraseñas o saturar el servidor.
//
// El backend recibe los pedidos a través de Vercel y de Render, así que
// la IP real del usuario no es la de la conexión: Vercel la informa en
// x-vercel-forwarded-for / x-real-ip, y si no están se usa la primera de
// X-Forwarded-For. Es una barrera más: la principal contra quien prueba
// contraseñas es el bloqueo por cuenta.
// =====================================================================

import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class LimitePedidosGuard extends ThrottlerGuard {
  protected async getTracker(peticion: Record<string, any>): Promise<string> {
    const cabeceras = peticion.headers ?? {};
    for (const nombre of ['x-vercel-forwarded-for', 'x-real-ip', 'x-forwarded-for']) {
      const valor = cabeceras[nombre];
      const primera = (Array.isArray(valor) ? valor[0] : valor)?.split(',')[0]?.trim();
      if (primera) return primera;
    }
    return peticion.ip;
  }
}
