# SDOP - Sistema de Gestión y Control de Obras Públicas

Secretaría Departamental de Obras Públicas - Gobierno Autónomo Departamental de Oruro

## Descripción

Sistema web para la administración y control de proyectos de obras públicas departamentales. Permite registrar proyectos, empresas constructoras, personas técnicas (supervisores/inspectores/fiscales), hitos presupuestarios, y avances de obra con evidencia fotográfica georeferenciada.

## Stack Tecnológico

### Frontend
- **Framework**: React 19 + Vite 6
- **UI**: Material-UI (MUI) 7
- **Routing**: React Router 6
- **HTTP**: Axios con interceptor JWT
- **Autenticación**: Google OAuth 2.0
- **Geolocalización**: navigator.geolocation API
- **EXIF**: exifr (extracción de metadatos de fotos en frontend)
- **Mapas**: React Leaflet (pendiente de implementar)
- **Gráficos**: Recharts (pendiente de implementar)

### Backend
- **Runtime**: Node.js + Express 5
- **Base de datos**: MongoDB Atlas (Mongoose 8)
- **Autenticación**: Passport.js (Google OAuth2), JWT, express-session
- **Archivos**: Cloudinary + Multer (imágenes)
- **EXIF**: exifr (extracción en servidor + fallback desde frontend)
- **Geoverificación**: haversine (implementación manual, sin librería externa)

## Estructura del Proyecto

```
SDOP/
├── backend/
│   ├── src/
│   │   ├── server.js              # Entry point (puerto 5001)
│   │   ├── app.js                 # Configuración Express (CORS, middleware, rutas, trust proxy)
│   │   ├── config/                # DB (con reconnect), Passport, Cloudinary
│   │   ├── models/                # 8 modelos Mongoose (+ Feedback)
│   │   ├── routes/                # 4 archivos de rutas (+ feedbackRoutes)
│   │   ├── controllers/           # Handlers de rutas (pendiente)
│   │   └── middleware/            # auth, exifExtractor, geoVerification
│   ├── index.js                   # Entry point para Render
│   └── render.yaml                # Config de despliegue en Render
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx               # Entry point (providers: Auth, MUI, Router)
│   │   ├── App.jsx                # Rutas
│   │   ├── theme.js               # Tema MUI personalizado (azul + ámbar)
│   │   ├── services/api.js        # Axios instance con interceptor JWT
│   │   ├── contexts/AuthContext.jsx  # Estado de autenticación
│   │   ├── layouts/MainLayout.jsx    # Layout principal (AppBar + Sidebar + Content + FeedbackButton)
│   │   ├── components/            # Componentes reutilizables
│   │   │   └── FeedbackButton.jsx    # Botón flotante de feedback
│   │   └── pages/                 # 13 páginas
│   └── vercel.json                # Config de despliegue en Vercel
│
└── README.md
```

## Modelos de Base de Datos

| Modelo | Descripción | Campos clave |
|--------|-------------|--------------|
| `Proyecto` | Proyectos de obra pública | codigoSisin, nombre, tipo, coordenadas, presupuestoTotal, avanceFisico, avanceFinanciero, empresaId, supervisorId, inspectorId |
| `AvanceObra` | Reportes de avance con fotos georeferenciadas | numeroReporte, avanceFisicoParcial/Acumulado, fotos[] (con EXIF + verificación), estado (BORRADOR/ENVIADO/APROBADO/OBSERVADO) |
| `Empresa` | Empresas constructoras | nombre, NIT, representanteLegal, especialidades, categoria, registroSICOPI |
| `PersonaTecnica` | Supervisores, inspectores, fiscales | nombreCompleto, CI, profesion, matriculaProfesional, rol, especialidad |
| `HitoPresupuestario` | Hitos de pago por avance | proyectoId, avanceFisicoMinimo, montoAsociado, estado |
| `Desembolso` | Registro de pagos | proyectoId, hitoId, monto, estado, comprobantePago |
| `Usuario` | Usuarios del sistema | nombre, email, password, googleId, rol (ADMIN/SUPERVISOR/INSPECTOR/FISCAL/VISOR) |
| `Feedback` | Retroalimentación de usuarios | tipo, titulo, descripcion, pagina, prioridad, estado, usuarioId, respuesta |

## Endpoints de la API

Base URL: `http://localhost:5001/api`

### Públicos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api` | Health check |

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/auth/google` | Iniciar OAuth Google |
| GET | `/api/auth/google/callback` | Callback Google OAuth |
| GET | `/api/auth/me` | Perfil del usuario actual |
| POST | `/api/auth/logout` | Cerrar sesión |

### Gestión (requiere JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/gestion/proyectos` | Listar proyectos (con filtros) |
| GET | `/api/gestion/proyectos/:id` | Proyecto por ID |
| POST | `/api/gestion/proyectos` | Crear proyecto |
| PUT | `/api/gestion/proyectos/:id` | Actualizar proyecto |
| DELETE | `/api/gestion/proyectos/:id` | Eliminar proyecto (solo admin) |
| GET/POST | `/api/gestion/empresas` | CRUD empresas |
| PUT | `/api/gestion/empresas/:id` | Actualizar empresa |
| GET/POST | `/api/gestion/personas-tecnicas` | CRUD personas técnicas |
| PUT | `/api/gestion/personas-tecnicas/:id` | Actualizar persona técnica |
| GET/POST | `/api/gestion/hitos` | CRUD hitos presupuestarios |
| PUT | `/api/gestion/hitos/:id` | Actualizar hito |
| GET/POST | `/api/gestion/desembolsos` | CRUD desembolsos |
| PUT | `/api/gestion/desembolsos/:id` | Actualizar desembolso |

### Avances (requiere JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/avances` | Listar avances (con filtros) |
| GET | `/api/avances/:id` | Avance por ID |
| POST | `/api/avances/upload` | Subir foto con verificación EXIF + GPS |
| POST | `/api/avances` | Crear reporte de avance |
| PUT | `/api/avances/:id` | Actualizar avance |
| PUT | `/api/avances/:id/aprobar` | Aprobar avance (supervisor) |
| PUT | `/api/avances/:id/observar` | Observar avance (supervisor) |
| GET | `/api/avances/stats` | Estadísticas de avances |

### Feedback (requiere JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/feedback` | Listar feedbacks (con filtros) |
| GET | `/api/feedback/stats` | Estadísticas de feedback |
| GET | `/api/feedback/:id` | Feedback por ID |
| POST | `/api/feedback` | Crear feedback (cualquier usuario) |
| PUT | `/api/feedback/:id` | Responder/cambiar estado (admin) |

## Páginas del Frontend

| Página | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| Login | `/login` | Autenticación Google OAuth | ✅ Completo |
| Dashboard | `/` | Estadísticas, proyectos recientes, avances recientes | ✅ Completo |
| Proyectos | `/proyectos` | Lista con filtros | ✅ Listar |
| ProyectoDetalle | `/proyectos/:id` | Detalle completo del proyecto | ✅ Completo |
| Avances | `/avances` | Lista con filtros por proyecto/estado | ✅ Listar |
| AvanceDetalle | `/avances/:id` | Detalle con fotos, EXIF, aprobar/observar | ✅ Completo |
| RegistrarAvance | `/avances/nuevo`, `/avances/:proyectoId/nuevo` | Formulario + captura foto + verificación GPS | ✅ Completo |
| Empresas | `/empresas` | Lista + crear | ⚠️ Falta editar/eliminar |
| Personas Técnicas | `/personas-tecnicas` | Lista + crear | ⚠️ Falta editar/eliminar |
| Hitos | `/hitos` | Lista + crear | ⚠️ Falta editar/eliminar |
| Feedback | `/feedback` | Panel admin para ver/responder feedbacks | ✅ Completo |

## Componentes

| Componente | Descripción |
|------------|-------------|
| `FeedbackButton` | Botón flotante (FAB) que abre modal de 3 pasos: tipo → formulario → confirmación |

## Flujo de Registro de Avance con Evidencia Georeferencial

### Captura Híbrida
1. **Tomar Foto**: Abre cámara trasera del celular (`capture="environment"`)
2. **Adjuntar Foto**: Selector de archivos desde galería del dispositivo

### Extracción EXIF en Frontend
- `exifr.parse(file)` se ejecuta ANTES de subir la foto
- Los metadatos extraídos se envían como campos adicionales en FormData (`exifLat`, `exifLng`, `exifMake`, `exifModel`, etc.)
- Esto compensa que Cloudinary elimina el EXIF durante el procesamiento de imágenes

### Verificación Automática
```
Foto subida → Backend intenta extraer EXIF del archivo
            → Si falla (Cloudinary lo eliminó), usa EXIF enviado desde frontend (fallback)
            → Captura GPS del navegador (Geolocation API)
            → Calcula distancia foto vs obra (haversine)
            → Verificación cruzada:
               ├─ EXIF GPS cerca de la obra? (radio configurable, default 500m)
               ├─ Browser GPS cerca de la obra?
               ├─ EXIF GPS y Browser GPS coinciden? (< 100m entre sí)
               └─ Foto tomada en últimas 48h? (si EXIF disponible)
            → Estado: VERIFICADO / SOSPECHOSO / RECHAZADO
```

### Middleware de Verificación
- `exifExtractor.js`: Extrae EXIF del archivo subido. Si no puede, usa datos enviados desde frontend como fallback
- `geoVerification.js`: Calcula distancias haversine y determina estado de verificación. Parsea `proyectoCoords` como JSON string

## Despliegue

### Arquitectura
- **Frontend**: Vercel (React SPA estático) → `https://sdop-azure.vercel.app`
- **Backend**: Render (Node.js Web Service) → `https://sdop.onrender.com`
- **Base de datos**: MongoDB Atlas (misma cluster que CONALJUVE, DB separada `sdop_gestion`)
- **Archivos**: Cloudinary (mismo account, carpetas `sdop/`)

### Variables de Entorno

**Backend (Render):**
```
NODE_ENV=production
PORT=5001
MONGO_URI=mongodb+srv://.../sdop_gestion?...
JWT_SECRET=...
SESSION_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=https://sdop-azure.vercel.app
```

**Frontend (Vercel):**
```
VITE_API_URL=https://sdop.onrender.com/api
```

### Configuración de OAuth Google
- Google Cloud Console → APIs & Services → Credentials
- Client ID existente del proyecto `conaljuve`
- Authorized redirect URI: `https://sdop.onrender.com/api/auth/google/callback`

### Configuración de Build
- `backend/.npmrc`: `legacy-peer-deps=true` (resuelve conflicto cloudinary v2 vs multer-storage-cloudinary)
- `backend/src/config/db.js`: Reconnect automático en lugar de `process.exit(1)`
- `backend/src/app.js`: `app.set('trust proxy', 1)` para HTTPS detrás de proxy de Render

## Comandos de Desarrollo

### Backend
```bash
cd backend
npm install
npm run dev    # nodemon con hot reload (puerto 5001)
npm start      # node sin hot reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # Vite dev server (puerto 5174)
npm run build        # Build de producción
npm run preview      # Preview del build
```

## Roles y Permisos

| Rol | Permisos |
|-----|----------|
| `ADMIN` | Acceso total: CRUD proyectos, empresas, personas, hitos, desembolsos, aprobar avances, gestionar feedback |
| `SUPERVISOR` | Ver proyectos, aprobar/observar avances |
| `INSPECTOR` | Ver proyectos asignados, registrar avances, enviar feedback |
| `FISCAL` | Ver proyectos, avances y desembolsos |
| `VISOR` | Solo lectura de proyectos y avances |

## Tipos de Proyecto

- `CAMINO` - Construcción/mejoramiento de caminos
- `PUENTE` - Construcción de puentes
- `ELECTRIFICACION` - Proyectos de electrificación rural
- `AGUA_POTABLE` - Sistemas de agua potable
- `SANEAMIENTO` - Sistemas de saneamiento básico
- `EDIFICACION` - Construcción de edificios públicos
- `OTRO` - Otros tipos de obra

## Estados de Proyecto

`PRE_INVERSION` → `DISEÑO` → `LICITACION` → `EJECUCION` → `CONCLUIDO` → `ENTREGADO`

## Estados de Avance

`BORRADOR` → `ENVIADO` → `APROBADO` (o `OBSERVADO`)

## Estados de Verificación de Foto

- `VERIFICADO` - GPS válido, dentro del radio, metadata consistente
- `SOSPECHOSO` - GPS fuera de radio, EXIF no coincide con browser GPS, o foto antigua
- `RECHAZADO` - Verificación fallida deliberadamente

## Estados de Feedback

`ABIERTO` → `EN_PROGRESO` → `RESUELTO` (o `RECHAZADO`/`CERRADO`)

## Tipos de Feedback

- `BUG` - Reporte de error
- `MEJORA` - Sugerencia de mejora
- `NUEVA_FUNCIONALIDAD` - Solicitud de nueva funcionalidad
- `OTRO` - Otro tipo de feedback

## Notas Importantes

1. **Independencia de CONALJUVE**: Este proyecto es completamente independiente. No comparte código con CONALJUVE pero reutiliza los mismos servicios (MongoDB Atlas, Cloudinary, Google OAuth) con configuraciones separadas.

2. **Captura híbrida**: El componente `RegistrarAvance` permite tanto tomar foto en vivo como adjuntar desde galería. En ambos casos se captura el GPS del navegador. El EXIF se extrae en el frontend y se envía como fallback al backend.

3. **Geolocalización**: Requiere HTTPS en producción para que `navigator.geolocation` funcione correctamente.

4. **Cloudinary**: Las fotos se guardan en la carpeta `sdop/avances`. Cloudinary elimina metadatos EXIF, por eso se extraen en el frontend antes de subir.

5. **MongoDB**: Usa la misma cluster que CONALJUVE pero con base de datos separada `sdop_gestion`.

6. **Orden de rutas**: Las rutas específicas (`/stats`) deben ir ANTES que las dinámicas (`/:id`) en Express.

7. **Trust proxy**: `app.set('trust proxy', 1)` es necesario en Render para que Express detecte HTTPS correctamente y construya las URLs de OAuth.

8. **Reconexión MongoDB**: El backend no se cierra si falla la conexión a MongoDB; reintenta cada 5 segundos.

9. **Siembra de datos**: `backend/src/seed.js` crea 28 proyectos, 5 empresas, 6 personas técnicas, 108 hitos y 7 feedbacks de prueba basados en informes reales de la Gobernación de Oruro.

10. **Simulación de avances**: `backend/src/simulateAvance.js` genera imágenes con EXIF GPS inyectado para probar los 3 escenarios de verificación (VERIFICADO, SOSPECHOSO, SIN GPS).
