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
