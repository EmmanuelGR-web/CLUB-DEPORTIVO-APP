# CLUB DEPORTIVO — Sistema de Gestión de Socios

Proyecto de tesis — Tecnicatura Universitaria en Programación, UTN FRT.

🔗 **Sitio publicado:** [club-deportivo-app.vercel.app](https://club-deportivo-app.vercel.app/)

🔗 **API (Swagger):** [club-deportivo-api-4w10.onrender.com/documentacion](https://club-deportivo-api-4w10.onrender.com/documentacion)

## Integrantes

- Emmanuel Gonzalez Rojas

## De qué se trata

Es el sistema de socios del club: cada socio tiene su cuenta, su carnet digital con código de barras, el estado de su cuota social y sus comprobantes de pago. El personal del club aprueba los pagos y administra las cuotas desde su propio panel.

El diseño del portal de socios toma la identidad visual que armé en el [proyecto C-DEPORTIVO](https://github.com/EmmanuelGR-web/C-DEPORTIVO) (rojo, bordó y dorado, la credencial con forma de escudo y la cinta de beneficios) y la lleva a esta aplicación con un backend real en NestJS y una base de datos PostgreSQL.

## Estado del proyecto

- [x] **Fase 1** — Esqueleto backend (NestJS) + base de datos (PostgreSQL) + autenticación con roles
- [x] **Fase 2** — Módulo de socios (carnet, código de barras, antigüedad y categoría)
- [x] **Fase 3** — Módulo de pagos y cuotas con aprobación administrativa y comprobantes
- [ ] Fase 4 — Información del club (fixture, plantel, historia, museo, complejo)
- [ ] **Fase 5** — Frontend: portal del socio rediseñado con Bootstrap ✔ · panel admin en migración
- [ ] Fase 6 — Chatbot asistente, documentación final

## Funcionalidades

### Portal del socio

- **Ingreso y registro:** pantalla dividida con la foto del club y el formulario en una tarjeta translúcida. Los formularios validan con Bootstrap (campos obligatorios, email, teléfono, contraseña de 8 caracteres) y se puede mostrar u ocultar la contraseña. Los errores del servidor se avisan con **SweetAlert2**.
- **Mi carnet:** resumen con saludo, aviso si hay una cuota pendiente o vencida y acceso directo para pagarla.
  - **Carnet digital** con el degradé de la categoría (Bronce, Plata u Oro), la foto recortada en forma de escudo, **código QR** y **código de barras CODE128** generados a partir del código único del socio. Con el mouse la credencial se inclina en 3D y tiene un reflejo tornasolado como un holograma.
  - Subida de la **foto de carnet** (JPG, PNG o WEBP de hasta 5 MB) a Supabase Storage.
  - **Estado de membresía:** estado, categoría, antigüedad y una barra que muestra cuánto falta para la próxima categoría (Bronce hasta 4 años, Plata de 5 a 14, Oro desde 15, igual que la tabla `categorias_socio`).
  - **Últimas cuotas** y una **cinta de beneficios** que gira sola; al tocar un beneficio se abren sus condiciones.
- **Cuota social:**
  - Indicadores de saldo adeudado, cuotas pagadas y cuotas en revisión.
  - **Informar un pago:** se elige el medio (efectivo, transferencia, débito o crédito) y SweetAlert2 pide confirmación antes de mandarlo. Si un pago fue rechazado, se puede volver a informar.
  - **Historial** con filtro por estado y orden por cuota, vencimiento o importe. Una cuota sin pagar con la fecha vencida se marca como _Vencida_.
  - **Comprobante** de cada pago aprobado en una ventana lista para imprimir.
- **Mi cuenta:** edición de los datos personales (provincia con lista desplegable), con botones para guardar o descartar que solo se habilitan si hubo cambios. El nombre se actualiza también en el menú.
- **Modo claro y oscuro** que usa el modo nativo de Bootstrap 5.3 (`data-bs-theme`) y se recuerda entre visitas.
- **Diseño responsive:** en el celular el menú lateral pasa a ser un panel que se abre desde una barra superior.

### Panel de administración

- Lista de pagos pendientes para aprobar o rechazar con observación.
- Alta y corrección de cuotas (período, monto y vencimiento).
- Al aprobar un pago se genera el comprobante con número único.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | **React 18** con **Next.js 14** (App Router) y TypeScript |
| Diseño | **Bootstrap 5.3** y **React Bootstrap** (portal del socio), Tailwind CSS (panel admin, en migración) |
| Avisos | **SweetAlert2** con botones de Bootstrap y los colores del club |
| Íconos | **React Icons** |
| Carnet | **qrcode.react** (QR) y **JsBarcode** (código de barras) |
| Backend | NestJS (Node.js) + TypeScript |
| ORM | TypeORM |
| Base de datos | PostgreSQL en **Supabase** |
| Autenticación | JWT (JSON Web Tokens) + bcrypt |
| Imágenes | Supabase Storage |
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
| `STORAGE_URL`, `STORAGE_CLAVE`, `STORAGE_BUCKET` | backend | Supabase Storage para las fotos de carnet |
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

- **Base de datos:** PostgreSQL de Supabase (plan gratuito). Las tablas se crean con los scripts de `backend/migraciones/`.
- **Backend:** servicio web en Render, con raíz en `backend/`, comando de build `npm install && npm run build` y de inicio `npm run start:prod`. Las variables del backend se cargan en *Environment*.
- **Frontend:** proyecto de Vercel con raíz en `frontend/` y la variable `NEXT_PUBLIC_API_URL` apuntando a la URL de Render.
- En Render, `CORS_ORIGENES` tiene la URL de Vercel para que solo el sitio publicado pueda usar la API.
- Mientras se prueba, Render y Vercel publican la rama `dev`; cuando quede estable pasan a `main`.
- En el plan gratis Render apaga el backend tras 15 minutos sin uso: la primera carga después de eso tarda unos 50 segundos.

## Estructura del repositorio

```
club-deportivo/
├── backend/               → API REST (NestJS)
│   ├── migraciones/        → scripts SQL versionados
│   └── src/modulos/        → autenticación, socios, pagos
├── frontend/              → Aplicación web (Next.js)
│   └── src/
│       ├── app/            → rutas: login, registro, mi-carnet, pagos, mi-perfil, admin
│       ├── componentes/
│       │   ├── socio/      → carnet, barra lateral, tablas, modales del portal
│       │   └── ui/         → componentes del panel admin
│       ├── contextos/      → sesión y tema
│       ├── datos/          → beneficios para socios
│       ├── estilos/        → club.css (paleta del club sobre Bootstrap)
│       ├── hooks/          → useEstadoCuenta, useTituloPagina
│       ├── servicios/      → llamadas a la API
│       └── utilidades/     → alertas (SweetAlert2), formatos y categorías
└── docs/                  → manuales de usuario y guías del proyecto
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
- **Componentes reutilizables:** en el frontend, el carnet, la tabla de cuotas, las secciones y los avisos son componentes que reciben todo por props y se usan en varias pantallas.
- **Seguridad de datos económicos**: solo el rol `admin_principal` puede
  acceder a información financiera del club, controlado por `RolesGuard`.
- **Escalabilidad**: índices en las columnas de búsqueda frecuente,
  tipo `NUMERIC` para montos de dinero (nunca `float`), y migraciones
  SQL versionadas pensando en 20.000+ socios.
