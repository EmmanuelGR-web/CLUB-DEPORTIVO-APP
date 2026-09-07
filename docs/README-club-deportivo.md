# CLUB DEPORTIVO

Guia de puesta en marcha y funcionamiento de la aplicacion de gestion de socios.

## Que es la aplicacion

`CLUB DEPORTIVO` es una aplicacion web para administrar socios, carnets digitales, cuotas y pagos declarados.

El proyecto esta dividido en dos aplicaciones:

- `backend/`: API REST construida con NestJS, TypeScript, TypeORM y PostgreSQL.
- `frontend/`: portal web construido con Next.js 14, React, TypeScript y Tailwind CSS.

La aplicacion usa una identidad visual basada en rojo, blanco hueso, carbon y dorado. El cambio de nombre conserva esa tematica y los tokens definidos en `frontend/tailwind.config.ts`.

## Que funciona actualmente

### Socios y autenticacion

- Registro de nuevos socios.
- Inicio de sesion con email y contrasena.
- Autenticacion mediante JWT.
- Roles disponibles: `socio`, `administrativo` y `admin_principal`.
- Proteccion de endpoints mediante guards de JWT y roles.
- Consulta y actualizacion del perfil propio.
- Persistencia local de la sesion en el navegador.

### Carnet digital

- Visualizacion del carnet del socio.
- Numero de socio, antiguedad, categoria y estado activo.
- Codigo de barras CODE128.
- Foto de carnet mediante almacenamiento configurado en Supabase.
- Categorias de antiguedad: Oro, Plata y Bronce.

### Cuotas y pagos

- Consulta de cuotas disponibles.
- Consulta del estado de cuenta.
- Registro de una declaracion de pago.
- Consulta de pagos propios.
- Creacion de cuotas y confirmacion o rechazo de pagos para personal autorizado desde la API.

El registro actual de pagos es manual: no procesa cobros en Mercado Pago, tarjeta, debito ni transferencia bancaria.

## Requisitos

- Node.js 20 o superior.
- npm.
- PostgreSQL local o una base compatible, por ejemplo Supabase o Railway.
- Supabase Storage si se desea cargar fotos de carnet.
- PowerShell en Windows o una terminal equivalente.

## Variables de entorno

### Backend

Copiar `backend/.env.example` como `backend/.env` y completar:

- `PUERTO`: puerto de la API, normalmente `3000`.
- `ENTORNO`: usar `desarrollo` durante el trabajo local.
- `DB_HOST`, `DB_PUERTO`, `DB_USUARIO`, `DB_CONTRASENA`, `DB_NOMBRE`: conexion PostgreSQL.
- `JWT_SECRETO`: clave larga y aleatoria para firmar tokens.
- `JWT_EXPIRACION`: duracion del token, por ejemplo `1d`.
- `STORAGE_URL`, `STORAGE_CLAVE`, `STORAGE_BUCKET`: configuracion del almacenamiento de imagenes.

Nunca subir el archivo `.env` ni compartir sus credenciales.

### Frontend

Copiar `frontend/.env.local.example` como `frontend/.env.local` y verificar:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Debe apuntar a la URL donde este ejecutandose el backend.

## Preparar la base de datos

1. Crear una base PostgreSQL vacia.
2. Abrir `backend/migraciones/001_crear_tablas_base.sql`.
3. Ejecutar todo el archivo en la base creada, por ejemplo desde el SQL Editor de Supabase o con `psql`.
4. Confirmar que las tablas, enums, indices y categorias iniciales fueron creados.

La migracion disponible es SQL plano. El script `migration:run` de `backend/package.json` corresponde al mecanismo de migraciones TypeORM y no ejecuta automaticamente este archivo SQL plano.

## Como levantar el proyecto en Windows

Abrir dos terminales.

### Terminal 1: backend

```powershell
Set-Location F:\FACULTAD\TESIS\club-san-martin\backend
npm install
Copy-Item .env.example .env
# Completar .env antes de iniciar
npm run start:dev
```

La API queda disponible en `http://localhost:3000`.
La documentacion Swagger queda disponible en `http://localhost:3000/documentacion`.

### Terminal 2: frontend

```powershell
Set-Location F:\FACULTAD\TESIS\club-san-martin\frontend
npm install
Copy-Item .env.local.example .env.local
npm run dev
```

Abrir la URL que informe Next.js, normalmente `http://localhost:3001` porque el backend ya usa el puerto `3000`.

## Flujo de uso

1. Entrar al portal frontend.
2. Crear una cuenta desde `Registro` o iniciar sesion.
3. Acceder a `Mi carnet` para consultar los datos y el codigo de barras.
4. Acceder a `Mi cuenta` para consultar o actualizar los datos permitidos.
5. Acceder a `Cuota social` para consultar cuotas y registrar una declaracion de pago.
6. El personal autorizado puede gestionar cuotas y estados de pagos usando la API documentada en Swagger.

## Endpoints principales

### Publicos

- `POST /autenticacion/registro`
- `POST /autenticacion/login`

### Socio autenticado

- `GET /socios/mi-perfil`
- `PATCH /socios/mi-perfil`
- `GET /socios/mi-carnet`
- `POST /socios/mi-carnet/foto`
- `GET /cuotas`
- `POST /pagos`
- `GET /mis-pagos`
- `GET /mi-estado-de-cuenta`

### Personal autorizado

- `POST /cuotas`
- `GET /pagos/pendientes`
- `PATCH /pagos/:id/estado`

Los endpoints protegidos requieren un token JWT en el header `Authorization: Bearer <token>`.

## Estructura importante

```text
backend/
  migraciones/                 Esquema inicial de PostgreSQL
  src/main.ts                  Arranque, CORS, validacion y Swagger
  src/config/                  Conexion a PostgreSQL
  src/comun/                   Guards, decoradores, enums y utilidades
  src/modulos/autenticacion/   Registro, login y estrategia JWT
  src/modulos/socios/          Perfil y carnet
  src/modulos/pagos/           Cuotas, pagos y estados
  src/modulos/almacenamiento/  Fotos de carnet

frontend/
  src/app/login/               Inicio de sesion
  src/app/registro/            Registro
  src/app/(app)/               Rutas protegidas
  src/componentes/             Barra lateral, carnet y controles UI
  src/contextos/               Sesion y tema claro/oscuro
  src/servicios/               Cliente HTTP y servicios de dominio
  public/                      Logo e imagenes visuales
```

## Identidad visual

El nombre visible de la aplicacion es `CLUB DEPORTIVO`. Se mantienen:

- Rojo principal y rojo profundo.
- Fondo hueso para el modo claro.
- Carbon para el modo oscuro.
- Dorado para acentos y la categoria Oro.
- Tipografias Barlow Condensed, Inter e IBM Plex Mono.
- Logo existente en `frontend/public/logo.png`.

## Situacion conocida antes de seguir desarrollando

Estas observaciones fueron detectadas durante la lectura y no se corrigieron automaticamente:

- `TarjetaCarnet.tsx` referencia `fondo.jpg`, pero el archivo disponible es `frontend/public/fondo.jpeg`.
- Hay un `rounded-` incompleto en `BarraLateral.tsx`.
- El frontend no tiene panel administrativo, aunque la API ya expone operaciones administrativas.
- El manual menciona descarga del carnet, pero actualmente el carnet solo se visualiza.
- El comprobante de pago se recibe como URL; no hay carga ni validacion de archivos implementada.
- El login no verifica expresamente si el socio fue desactivado.
- CORS esta abierto a cualquier origen durante la ejecucion actual.
- El JWT no revalida cambios de rol hasta que el token expire.
- La tabla de auditoria existe en la migracion, pero no hay logica que la complete.
- No se implementaron recuperacion de contrasena, verificacion de email ni rate limiting.
- Existe un `.env` local con credenciales: deben rotarse si fueron compartidas o expuestas.

Estas decisiones requieren definicion funcional antes de corregirse: aprobacion de registros, permisos de cada rol, proveedor de pagos, auditoria, panel administrativo, descarga del carnet y politica de almacenamiento de imagenes.

## Comandos utiles

Desde `backend/`:

```powershell
npm run build
npm run start:dev
npm run lint
npm test
```

Desde `frontend/`:

```powershell
npm run build
npm run dev
npm run lint
```

## Documentacion complementaria

- `README.md`: resumen general del repositorio.
- `backend/README.md`: detalles de la API.
- `frontend/README.md`: detalles del portal web.
- `docs/manual-usuario-es.md`: manual de usuario en espanol.
- `docs/manual-usuario-en.md`: manual de usuario en ingles.
- `docs/guia-commits.md`: convenciones de commits.
