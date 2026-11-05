import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtOpcionalGuard extends AuthGuard('jwt') {
  handleRequest<T>(_error: unknown, usuario: T): T | null {
    return usuario || null;
  }
}
