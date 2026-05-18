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
- **EXIF**: exifr (extracción de metadatos de fotos)
- **Mapas**: React Leaflet (pendiente de implementar)
- **Gráficos**: Recharts (pendiente de implementar)

### Backend
- **Runtime**: Node.js + Express 5
- **Base de datos**: MongoDB Atlas (Mongoose 8)
- **Autenticación**: Passport.js (Google OAuth2), JWT, express-session
- **Archivos**: Cloudinary + Multer (imágenes)
- **EXIF**: exifr (extracción de metadatos en servidor)
- **Geoverificación**: haversine-distance (cálculo de distancia GPS)

## Estructura del Proyecto

```
SDOP/
├── backend/
│   ├── src/
│   │   ├── server.js              # Entry point (puerto 5001)
│   │   ├── app.js                 # Configuración Express (CORS, middleware, rutas)
│   │   ├── config/                # DB, Passport, Cloudinary
│   │   ├── models/                # 7 modelos Mongoose
│   │   ├── routes/                # 3 archivos de rutas
│   │   ├── controllers/           # Handlers de rutas
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
│   │   ├── layouts/MainLayout.jsx    # Layout principal (AppBar + Sidebar + Content)
│   │   └── pages/                 # 10 páginas
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

## Flujo de Registro de Avance con Evidencia Georeferencial

### Captura Híbrida
1. **Tomar Foto**: Abre cámara trasera del celular (`capture="environment"`)
2. **Adjuntar Foto**: Selector de archivos desde galería del dispositivo

### Verificación Automática
```
Foto subida → Backend extrae EXIF (si existe)
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
- `exifExtractor.js`: Extrae metadatos EXIF de la imagen subida
- `geoVerification.js`: Calcula distancias haversine y determina estado de verificación

## Despliegue

### Arquitectura
- **Frontend**: Vercel (React SPA estático)
- **Backend**: Render o Koyeb (Node.js Web Service)
- **Base de datos**: MongoDB Atlas (misma cluster que CONALJUVE, DB separada `sdop_gestion`)
- **Archivos**: Cloudinary (mismo account, carpetas `sdop/`)

### Variables de Entorno

**Backend:**
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
FRONTEND_URL=https://sdop.vercel.app
```

**Frontend:**
```
VITE_API_URL=https://sdop-backend.onrender.com/api
```

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
| `ADMIN` | Acceso total: CRUD proyectos, empresas, personas, hitos, desembolsos, aprobar avances |
| `SUPERVISOR` | Ver proyectos, aprobar/observar avances |
| `INSPECTOR` | Ver proyectos asignados, registrar avances |
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

## Notas Importantes

1. **Independencia de CONALJUVE**: Este proyecto es completamente independiente. No comparte código con CONALJUVE pero reutiliza los mismos servicios (MongoDB Atlas, Cloudinary, Google OAuth) con configuraciones separadas.

2. **Captura híbrida**: El componente `RegistrarAvance` permite tanto tomar foto en vivo como adjuntar desde galería. En ambos casos se captura el GPS del navegador. Si la foto tiene EXIF, se hace verificación cruzada.

3. **Geolocalización**: Requiere HTTPS en producción para que `navigator.geolocation` funcione correctamente.

4. **Cloudinary**: Las fotos se guardan en la carpeta `sdop/avances`. Documentos en `sdop/documentos`.

5. **MongoDB**: Usa la misma cluster que CONALJUVE pero con base de datos separada `sdop_gestion`.

6. **LLM pendiente**: La verificación con LLM de imágenes está planificada para una fase posterior. Actualmente la verificación es puramente basada en GPS + EXIF.
