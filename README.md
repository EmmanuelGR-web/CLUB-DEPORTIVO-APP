# CLUB DEPORTIVO — Sistema de Gestión de Socios

Proyecto de tesis — Tecnicatura Universitaria en Programación, UTN FRT.

🔗 **Sitio publicado:** [club-deportivo-app.vercel.app](https://club-deportivo-app.vercel.app/)

🔗 **API (Swagger):** [club-deportivo-api-4w10.onrender.com/documentacion](https://club-deportivo-api-4w10.onrender.com/documentacion)

## Integrantes

- Emmanuel Gonzalez Rojas

## De qué se trata

Es el sistema de socios del club: cada socio tiene su cuenta, su carnet digital, su cuota social con los comprobantes y una bandeja de mensajes con administración. El personal del club valida las altas, revisa los comprobantes y atiende los pedidos desde su propio panel.

El portal reproduce el sistema que armé en el [proyecto C-DEPORTIVO](https://github.com/EmmanuelGR-web/C-DEPORTIVO): las mismas pantallas, la misma identidad (rojo, bordó y dorado, la credencial con forma de escudo, la cinta de beneficios) y las mismas reglas. La diferencia es que allá los datos vivían en el navegador y en MockAPI; acá todo se guarda en un backend propio en NestJS con PostgreSQL, así que lo que hace un usuario lo ve cualquier otro desde cualquier dispositivo.

## Estado del proyecto

- [x] **Fase 1** — Esqueleto backend (NestJS) + base de datos (PostgreSQL) + autenticación con roles
- [x] **Fase 2** — Módulo de socios (carnet, código de barras, antigüedad y categoría)
- [x] **Fase 3** — Módulo de pagos y cuotas con aprobación administrativa y comprobantes
- [ ] Fase 4 — Información del club (fixture, plantel, historia, museo, complejo)
- [ ] **Fase 5** — Frontend con React Bootstrap: portal del socio ✔ · panel del personal ✔ · panel del administrador principal
- [ ] Fase 6 — Chatbot asistente, documentación final

## Funcionalidades

### Ingreso y registro

- **Ingreso con acceso por roles:** cada usuario entra a su propio panel (`/socio`, `/empleado`, `/admin`) y las rutas están protegidas. Opción de **mantener la sesión iniciada** y **recuperar contraseña**. Un desplegable muestra los usuarios de prueba para entrar con un toque.
- **Registro de nuevo socio:** al subir las fotos del DNI, la **IA de Gemini** (Google) lee el documento y completa nombre, apellido, DNI, fecha de nacimiento y domicilio, que el socio puede corregir; queda guardado qué leyó la IA y qué se corrigió. La selfie se saca con la cámara del dispositivo y queda para el carnet digital. El pago puede ser en efectivo o con tarjeta (Banco Nación, Banco Macro, Mercado Pago o Ualá), validando la marca, el número (algoritmo de Luhn), el vencimiento y el código según cada emisor. De la tarjeta solo se guardan la marca y los últimos 4 números. El socio queda **en validación** hasta que el personal revisa sus datos.

### Panel del socio

- **Resumen:** estado de la membresía y categoría automática según la antigüedad (Bronce hasta 2 años, Plata hasta 10, Oro más de 10); **carnet digital** con foto en forma de escudo, QR y código de barras, que se inclina en 3D con el mouse y se descarga en **PDF** para imprimir; movimientos y beneficios exclusivos en una cinta que gira sola.
- **Datos personales:** foto de perfil desde la cámara o un archivo (se puede cambiar una vez cada 6 meses); los datos de contacto se actualizan al instante y los de documento (nombre, apellido, DNI, nacimiento) quedan **pendientes hasta que el personal los aprueba**. Cada cambio queda en el historial de la cuenta. Cambio de contraseña verificando la actual.
- **Facturas y pagos:** la cuota se genera sola cada mes desde el alta, vence el **día 15** y después suma un **recargo del 0,1 % por día**. El socio **informa el pago** con el comprobante (imagen o PDF): la **IA lee el monto, la fecha, el medio y el número de operación** y avisa si el monto coincide con la cuota. Historial con filtros por año, estado, medio y concepto, orden por columna, paginación y descarga del **estado de cuenta en PDF**. Cambio de medio de pago, con o sin **débito automático** (las cuotas se cobran solas).
- **Bandeja de entrada:** correo institucional del socio, conversaciones con administración, respuestas y **archivos adjuntos** (imágenes que se optimizan solas o PDF).
- **Panel en vivo:** se actualiza cada 10 segundos y al volver a la pestaña, y tiene un botón para actualizar a mano.

### Panel del personal administrativo

- **Mi jornada:** barra con el estado (en línea o en descanso), hora de ingreso, tiempo trabajado y el descanso del día sobre los **30 minutos permitidos**. Botones para tomar descanso, volver y terminar la jornada (registra la salida y cierra la sesión con un resumen del día). El panel avisa al servidor cada 20 segundos que la persona sigue conectada, así la dirección la ve en vivo.
- **Resumen de gestión:** solicitudes pendientes, mensajes sin responder, socios activos y cambios de la semana, con acceso directo a cada sección.
- **Solicitudes:** altas online, cambios de datos hechos por socios y comprobantes de pago, con búsqueda y filtros por estado y tipo. Cada una se **autoriza o rechaza con motivo** y le llega un aviso al socio en su bandeja. En las altas se ve la foto y lo que **leyó la IA del DNI** (y qué corrigió el socio); en los comprobantes, el archivo, la **verificación de la IA** y una alerta si el número de operación ya figura en otro comprobante. Rechazar un cambio que el socio ya había aplicado **vuelve a los datos anteriores**.
- **Socios:** padrón con búsqueda y la **ficha** de cada socio: deuda actual, corrección de datos (se aplica al instante y queda registrada con la firma de quien la hizo), medio de pago, movimientos y **restablecer la contraseña** al DNI.
- **Mensajes de socios:** conversaciones de la bandeja de los socios, filtro de las que faltan responder y respuesta como administración.
- **Registro de cambios:** constancia de cada cambio en las cuentas, agrupada por día, con filtros por tipo, por quién lo hizo (socio o personal), por fechas y búsqueda.
- **Administración principal:** canal interno con la dirección del club.
- **Nuevo socio:** alta presencial en la sede con foto opcional y tarjeta o efectivo; el socio queda activo con su DNI como contraseña inicial.
- **Mis datos:** código de empleado, puesto, sector, horario y antigüedad.
- Si la dirección le carga **vacaciones, licencia o suspensión**, la persona no puede ingresar mientras dure, y si estaba conectada se le cierra la sesión.

### En todo el portal

- **Modo claro y oscuro** con el modo nativo de Bootstrap 5.3 (`data-bs-theme`), que se recuerda entre visitas.
- **SweetAlert2** para errores, confirmaciones y avisos, con botones de Bootstrap y los colores del club.
- **Diseño responsive** para celular, tablet y computadora: el menú lateral pasa a ser un panel desplegable y las tablas se muestran como listas en pantallas chicas.

### Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Socio | `socio@club.com` | `socio123` |
| Personal administrativo | `administrativo@club.com` | `admin123` |
| Administrador principal | `administrador@club.com` | `principal123` |

Pedro Díaz (A01) es el personal administrativo con usuario; la nómina trae a otras cuatro personas, entre ellas Silvia Fernández con licencia médica. El socio de prueba es Juan Pérez (Plata, socio desde marzo de 2020, débito automático con Visa). El padrón también trae socios de ejemplo que entran con la contraseña `socio123`: por ejemplo `lucas.herrera@mail.com` (cuota del mes pendiente, para probar informar un pago), `sofia.romero@mail.com` (comprobante en revisión) y `camila.sosa@mail.com` (alta en validación).

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | **React 18** con **Next.js 14** (App Router) |
| Diseño | **Bootstrap 5.3** y **React Bootstrap** |
| Avisos | **SweetAlert2** con botones de Bootstrap y los colores del club |
| Íconos | **React Icons** |
| Carnet y PDF | **qrcode.react** (QR del carnet), **jsPDF** y **jspdf-autotable** (credencial y estado de cuenta) |
| Lectura de documentos | **API de Gemini** (Google, plan gratuito), llamada desde el backend |
| Backend | NestJS (Node.js) + TypeScript |
| ORM | TypeORM |
| Base de datos | PostgreSQL en **Supabase** |
| Autenticación | JWT (JSON Web Tokens) + bcrypt |
| Hosting backend | **Render** |
| Hosting frontend | **Vercel** |

## Instalación y ejecución

Hace falta tener [Node.js](https://nodejs.org/) instalado.

```bash
git clone https://github.com/EmmanuelGR-web/CLUB-DEPORTIVO-APP.git
cd CLUB-DEPORTIVO-APP
```

**Backend** (en una terminal):

```bash
cd backend
npm install
cp .env.example .env   # completar con los datos de Supabase
npm run migrar -- migraciones/003_portal_del_socio.sql   # solo si la base viene de una versión anterior
npm run migrar -- migraciones/004_personal_jornadas_noticias.sql
npm run sembrar        # opcional: carga los usuarios y socios de prueba
npm run start:dev
```

**Frontend** (en otra terminal):

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

| Variable | Dónde | Para qué sirve |
|---|---|---|
| `DB_HOST`, `DB_PUERTO`, `DB_USUARIO`, `DB_CONTRASENA`, `DB_NOMBRE` | backend | Conexión a PostgreSQL (Supabase → *Project Settings → Database*) |
| `JWT_SECRETO`, `JWT_EXPIRACION` | backend | Firma y duración de las sesiones |
| `GEMINI_API_KEY` | backend | Clave gratuita de [Google AI Studio](https://aistudio.google.com/apikey) para leer DNI y comprobantes (opcional: sin ella se completan a mano) |
| `CORS_ORIGENES`, `DB_SSL` | backend | En producción: dominio del frontend y conexión cifrada a Supabase |
| `NEXT_PUBLIC_API_URL` | frontend | URL del backend (local: `http://localhost:3000`) |

## Flujo de trabajo con Git

```
feat/… o fix/…  ──►  dev  ──►  main  ──►  deploy (Vercel + Render)
```

1. Cada funcionalidad se hace en su propia rama creada desde `dev` (`feat/panel-socio-bootstrap`, `fix/…`).
2. Cuando está lista se mergea a `dev`, que es la rama de integración donde se prueba todo junto.
3. Cuando `dev` está estable se mergea a `main`, que es la que se publica.

Los mensajes de commit siguen la [guía de commits](docs/guia-commits.md).

## Despliegue

- **Base de datos:** PostgreSQL de Supabase (plan gratuito). Las tablas se crean corriendo en orden los scripts de `backend/migraciones/` (`001` a `004`), desde el *SQL Editor* de Supabase o con `npm run migrar -- <archivo>`, que aplica cada script en una transacción. Los usuarios de prueba se cargan con `npm run sembrar` desde `backend/`; se puede repetir sin duplicar nada.
- **Backend:** servicio web en Render, con raíz en `backend/`, comando de build `npm install && npm run build` y de inicio `npm run start:prod`. Las variables del backend se cargan en *Environment*.
- **Frontend:** proyecto de Vercel con raíz en `frontend/` y la variable `NEXT_PUBLIC_API_URL` apuntando a la URL de Render.
- En Render, `CORS_ORIGENES` tiene la URL de Vercel para que solo el sitio publicado pueda usar la API.
- Mientras se prueba, Render y Vercel publican la rama `dev`; cuando quede estable pasan a `main`.
- En el plan gratis Render apaga el backend tras 15 minutos sin uso: la primera carga después de eso tarda unos 50 segundos.

## Estructura del repositorio

```
club-deportivo/
├── backend/                  → API REST (NestJS)
│   ├── migraciones/           → scripts SQL versionados
│   ├── scripts/               → migrar.js y sembrar.js (datos de prueba)
│   └── src/
│       ├── comun/             → guards, decoradores, reglas de cuotas y correos
│       └── modulos/
│           ├── autenticacion/  → login y alta online
│           ├── mi-cuenta/      → todo lo que hace el socio desde su panel
│           ├── perfiles/       → arma el perfil y aplica cambios con su constancia
│           ├── pagos/          → estado de cuenta, pagos informados y débito automático
│           ├── mensajes/       → bandeja de entrada
│           ├── registro-cambios/ → historial y pedidos pendientes de aprobación
│           ├── archivos/       → comprobantes y adjuntos
│           ├── ia/             → lectura de DNI y comprobantes con Gemini
│           ├── gestion/        → panel del personal: solicitudes, padrón, mensajes, altas
│           ├── personal/       → nómina del club, ausencias y jornadas
│           └── socios/         → acceso a la tabla de socios
├── frontend/                 → Aplicación web (Next.js)
│   ├── public/                → escudo y fotos del club
│   └── src/
│       ├── app/               → rutas: login, registro, socio, empleado, admin
│       ├── componentes/
│       │   ├── auth/           → ingreso, registro, cámara, tarjeta
│       │   ├── comun/          → tarjetas, estados, adjuntos, modo oscuro, canal interno
│       │   ├── empleado/       → solicitudes, ficha del socio, jornada, registro de cambios
│       │   ├── layout/         → barra lateral y estructura de los paneles
│       │   ├── paneles/        → panel de cada rol
│       │   └── socio/          → carnet, pagos, datos personales, bandeja
│       ├── contextos/         → sesión y tema
│       ├── datos/             → menús, beneficios, emisores de tarjeta
│       ├── estilos/           → paleta del club sobre Bootstrap y modo oscuro
│       ├── hooks/             → datos en vivo, tamaño de pantalla, título
│       ├── servicios/         → llamadas a la API
│       └── utilidades/        → alertas, fechas, tarjetas, PDF, credencial
└── docs/                     → manuales de usuario y guías del proyecto
```

## Documentación

- [Guía completa del proyecto y puesta en marcha](docs/README-club-deportivo.md)
- [Manual de usuario (Español)](docs/manual-usuario-es.md)
- [Manual de usuario (English)](docs/manual-usuario-en.md)
- [README del backend](backend/README.md)

## Principios de diseño aplicados

- **SOLID**: cada módulo tiene una responsabilidad (Single Responsibility),
  los guards son extensibles sin modificar código existente (Open/Closed),
  y los servicios dependen de abstracciones (repositorios de TypeORM) en
  vez de detalles concretos de la base de datos (Dependency Inversion).
- **Componentes reutilizables:** en el frontend, el carnet, la tabla de pagos, los formularios de datos y los avisos son componentes que reciben todo por props y se reutilizan entre el panel del socio y el del personal.
- **El servidor decide:** el monto de cada cuota, los recargos y qué cambios necesitan aprobación se calculan en el backend; el navegador solo los muestra. Así nadie puede pagar menos editando la página.
- **Seguridad de datos económicos**: solo el rol `admin_principal` puede
  acceder a información financiera del club, controlado por `RolesGuard`.
- **Escalabilidad**: índices en las columnas de búsqueda frecuente,
  tipo `NUMERIC` para montos de dinero (nunca `float`), y migraciones
  SQL versionadas pensando en 20.000+ socios.
