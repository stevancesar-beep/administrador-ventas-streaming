# Panel de Administración de Ventas de Streaming

Sistema completo para gestionar tus ventas de cuentas de streaming (Netflix, Spotify, Disney+, etc.) con control de clientes, suscripciones y pagos.

## Características

- **Dashboard con estadísticas**: Vista general con métricas importantes
- **Gestión de Clientes**: Añade, edita y elimina clientes
- **Gestión de Cuentas**: Administra tus cuentas de streaming
- **Control de Suscripciones**: Gestiona quién usa qué cuenta y cuándo vence
- **Historial de Pagos**: Registra todos los pagos de tus clientes
- **Alertas automáticas**: Notificaciones de suscripciones próximas a vencer
- **Interfaz moderna**: Diseño responsive con Tailwind CSS

## Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Hosting**: Railway (recomendado)

## Instalación Local

### 1. Clonar el proyecto

```bash
cd "Administrador de ventas"
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar PostgreSQL

Necesitas tener PostgreSQL instalado. Puedes:
- Instalarlo localmente
- Usar Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`
- Usar un servicio en la nube (Railway, Supabase, etc.)

### 4. Configurar variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
DATABASE_URL="postgresql://usuario:password@localhost:5432/streaming_admin"
```

### 5. Ejecutar migraciones de Prisma

```bash
npx prisma generate
npx prisma db push
```

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Despliegue en Railway

Railway es la forma más fácil de desplegar este proyecto.

### Paso 1: Crear cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Regístrate con tu cuenta de GitHub

### Paso 2: Crear un nuevo proyecto

1. Click en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Si no has conectado GitHub, hazlo ahora
4. Selecciona el repositorio de este proyecto

### Paso 3: Añadir PostgreSQL

1. En tu proyecto de Railway, click en "+ New"
2. Selecciona "Database" → "Add PostgreSQL"
3. Railway automáticamente creará la base de datos y la variable `DATABASE_URL`

### Paso 4: Configurar el servicio de Next.js

Railway detectará automáticamente que es un proyecto Next.js. Solo necesitas:

1. Asegurarte de que la variable `DATABASE_URL` esté conectada
2. Railway la conecta automáticamente cuando añades PostgreSQL

### Paso 5: Ejecutar migraciones

Una vez desplegado, necesitas ejecutar las migraciones:

1. En Railway, ve a tu servicio de Next.js
2. Click en "Settings" → "Deploy"
3. En "Custom Start Command", añade:
   ```bash
   npx prisma generate && npx prisma db push && npm start
   ```

O ejecuta las migraciones desde tu terminal local conectándote a la base de datos de Railway:

```bash
# Copia la DATABASE_URL de Railway
DATABASE_URL="postgresql://..." npx prisma db push
```

### Paso 6: Desplegar

1. Railway desplegará automáticamente
2. Obtendrás una URL pública para tu aplicación
3. ¡Tu panel ya está en línea!

## Configuración adicional para Railway

### Build Command
Railway usa automáticamente:
```bash
npm run build
```

### Start Command (recomendado)
```bash
npx prisma generate && npx prisma db push && npm start
```

Esto asegura que Prisma esté configurado antes de iniciar la aplicación.

## Uso del Sistema

### 1. Crear Cuentas de Streaming

1. Ve a "Cuentas"
2. Click en "Nueva Cuenta"
3. Ingresa la plataforma (Netflix, Spotify, etc.)
4. Agrega las credenciales
5. Define cuántos perfiles/clientes pueden usar la cuenta

### 2. Añadir Clientes

1. Ve a "Clientes"
2. Click en "Nuevo Cliente"
3. Ingresa nombre, email, teléfono
4. Añade notas si es necesario

### 3. Crear Suscripciones

1. Ve a "Suscripciones"
2. Click en "Nueva Suscripción"
3. Selecciona el cliente y la cuenta
4. Define fecha de inicio y fin
5. Establece el precio
6. Marca si se renueva automáticamente

### 4. El Dashboard

El dashboard muestra:
- Total de clientes
- Cuentas disponibles
- Suscripciones activas
- Ingresos del mes
- Alertas de suscripciones próximas a vencer (próximos 7 días)

## Scripts Disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Compilar para producción
npm start           # Iniciar servidor de producción
npm run lint        # Ejecutar linter
```

## Estructura del Proyecto

```
├── app/
│   ├── api/            # API Routes
│   │   ├── clientes/
│   │   ├── cuentas/
│   │   ├── suscripciones/
│   │   ├── pagos/
│   │   └── stats/
│   ├── clientes/       # Página de clientes
│   ├── cuentas/        # Página de cuentas
│   ├── suscripciones/  # Página de suscripciones
│   ├── layout.tsx
│   └── page.tsx        # Dashboard
├── components/
│   ├── ui/             # Componentes UI reutilizables
│   ├── Navbar.tsx
│   └── StatsCard.tsx
├── lib/
│   └── prisma.ts       # Cliente de Prisma
├── prisma/
│   └── schema.prisma   # Esquema de base de datos
└── package.json
```

## Modelo de Datos

### Cuenta
- Plataforma (Netflix, Spotify, etc.)
- Credenciales (email/password)
- Perfil específico (opcional)
- Máximo de perfiles que soporta

### Cliente
- Información de contacto
- Notas adicionales

### Suscripción
- Relación Cliente-Cuenta
- Fechas de inicio y fin
- Precio
- Estado (activa/vencida/cancelada)
- Renovación automática

### Pago
- Vinculado a una suscripción
- Monto y fecha
- Método de pago
- Comprobante

## Soporte

Si tienes problemas:
1. Verifica que PostgreSQL esté corriendo
2. Confirma que las variables de entorno estén configuradas
3. Asegúrate de haber ejecutado `npx prisma db push`
4. Revisa los logs en Railway si hay errores en producción

## Próximas Mejoras

- [ ] Sistema de autenticación
- [ ] Notificaciones por email/WhatsApp
- [ ] Exportar reportes a PDF/Excel
- [ ] Gráficos de ingresos históricos
- [ ] API para integraciones externas

## Licencia

MIT
