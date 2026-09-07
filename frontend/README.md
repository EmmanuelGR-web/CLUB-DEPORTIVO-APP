# Frontend - CLUB DEPORTIVO

Portal de socios construido con **Next.js 14 + React + TypeScript + Tailwind CSS**.

## Instalación

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Confirmá que `NEXT_PUBLIC_API_URL` en `.env.local` apunte a tu backend
(por defecto `http://localhost:3000`, que es donde corre NestJS en desarrollo).

## Levantar en modo desarrollo

Con el backend ya corriendo en otra terminal:

```bash
npm run dev
```

Abrí `http://localhost:3001` (o el puerto que indique la terminal — si el 3000
ya está ocupado por el backend, Next.js elige el siguiente disponible automáticamente).

## Estructura

```
src/
├── app/                    # rutas (App Router de Next.js)
│   ├── login/               # inicio de sesión
│   ├── registro/            # alta de socio nuevo
│   └── (app)/                # rutas protegidas (requieren sesión)
│       ├── mi-carnet/         # carnet digital con código de barras
│       ├── mi-perfil/         # datos personales
│       └── pagos/             # estado de cuenta y pago de cuotas
├── componentes/            # componentes reutilizables (Boton, CampoTexto, etc.)
├── contextos/              # AuthContexto (sesión) y TemaContexto (modo oscuro)
├── servicios/              # funciones que hablan con la API del backend
└── tipos/                  # tipos de TypeScript compartidos
```

## Identidad visual

Los tokens de diseño (colores, tipografías) viven en `tailwind.config.ts`.
Paleta basada en los colores reales del escudo del club (rojo/blanco), con
un acento dorado ligado a la categoría "Oro" de antigüedad de socio.
