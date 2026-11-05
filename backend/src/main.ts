process.env.TZ = process.env.TZ || 'America/Argentina/Buenos_Aires';

import { NestFactory } from '@nestjs/core';
import { json, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { CABECERA_CLIENTE, COOKIE_SESION } from './modulos/autenticacion/sesion';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function iniciarAplicacion() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    helmet({
      hsts: { maxAge: 31_536_000, includeSubDomains: true },
      contentSecurityPolicy: { directives: { 'script-src': ["'self'", "'unsafe-inline'"], 'img-src': ["'self'", 'data:', 'https:'] } },
    }),
  );
  app.use(cookieParser());

  app.use((peticion: Request, respuesta: Response, siguiente: NextFunction) => {
    const cambiaDatos = !['GET', 'HEAD', 'OPTIONS'].includes(peticion.method);
    if (cambiaDatos && peticion.cookies?.[COOKIE_SESION] && peticion.get(CABECERA_CLIENTE) !== 'web') {
      respuesta.status(403).json({ statusCode: 403, message: 'Pedido rechazado por seguridad.' });
      return;
    }
    siguiente();
  });

  app.use(json({ limit: '12mb' }));

  const configuracion = app.get(ConfigService);
  const puerto = configuracion.get<number>('PUERTO') ?? configuracion.get<number>('PORT') ?? 3000;

  const origenes = configuracion
    .get<string>('CORS_ORIGENES', '')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origenes.length > 0 ? origenes : true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', CABECERA_CLIENTE],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const documentoSwagger = new DocumentBuilder()
    .setTitle('API - CLUB DEPORTIVO')
    .setDescription(
      'API para la gestión de socios, pagos, disciplinas deportivas y administración de CLUB DEPORTIVO',
    )
    .setVersion('0.1')
    .addBearerAuth()
    .build();
  const documento = SwaggerModule.createDocument(app, documentoSwagger);
  SwaggerModule.setup('documentacion', app, documento);

  await app.listen(puerto);
  console.log(`✅ API del club corriendo en: http://localhost:${puerto}`);
  console.log(`📄 Documentación disponible en: http://localhost:${puerto}/documentacion`);
}

iniciarAplicacion();
