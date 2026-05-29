# SDOP - Sistema de Gestión y Control de Obras Públicas

Secretaría Departamental de Obras Públicas - Gobierno Autónomo Departamental de Oruro

## Descripción

Sistema web para la administración y control de proyectos de obras públicas departamentales. Permite registrar proyectos, empresas constructoras, personas técnicas (supervisores/inspectores/fiscales), hitos presupuestarios, y avances de obra con evidencia fotográfica georeferenciada. Gestiona 5 unidades organizativas (DI, JE, JT, JUPRE, JUS) con modelos de datos dedicados y control de acceso por unidad.

## Stack Tecnológico

### Frontend
- **Framework**: React 19 + Vite 6
- **UI**: Material-UI (MUI) 7
- **Routing**: React Router 6
- **HTTP**: Axios con interceptor JWT
- **Autenticación**: Local (email/password) con JWT
- **Geolocalización**: navigator.geolocation API
- **EXIF**: exifr (extracción de metadatos de fotos en frontend)
- **Mapas**: React Leaflet (pendiente de implementar)
- **Gráficos**: Recharts (pendiente de implementar)

### Backend
- **Runtime**: Node.js + Express 5
- **Base de datos**: MongoDB Atlas (Mongoose 8)
- **Autenticación**: JWT (email/password), sin OAuth externo
- **Archivos**: Cloudinary + Multer (imágenes)
- **EXIF**: exifr (extracción en servidor + fallback desde frontend)
- **Geoverificación**: haversine (implementación manual, sin librería externa)
- **Tests**: Jest + Supertest + mongodb-memory-server

## Estructura del Proyecto

```
SDOP/
├── backend/
│   ├── src/
│   │   ├── server.js              # Entry point (puerto 5001)
│   │   ├── app.js                 # Configuración Express (CORS, middleware, rutas, trust proxy)
│   │   ├── config/                # DB (con reconnect), Cloudinary
│   │   ├── models/                # 33 modelos Mongoose
│   │   ├── routes/                # 6 archivos de rutas
│   │   ├── controllers/           # Handlers de rutas (pendiente)
│   │   └── middleware/            # auth, permission, unitAccess, exifExtractor, geoVerification
│   ├── tests/                     # Tests con Jest
│   ├── index.js                   # Entry point para Render
│   └── render.yaml                # Config de despliegue en Render
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx               # Entry point (providers: Auth, MUI, Router)
│   │   ├── App.jsx                # Rutas (38 rutas)
│   │   ├── theme.js               # Tema MUI personalizado (azul + ámbar)
│   │   ├── services/api.js        # Axios instance con interceptor JWT
│   │   ├── contexts/AuthContext.jsx  # Estado de autenticación
│   │   ├── layouts/MainLayout.jsx    # Layout principal con UnitSidebar
│   │   ├── config/unitMenus.js       # Configuración de menús por unidad
│   │   ├── components/            # Componentes reutilizables
│   │   │   ├── FeedbackButton.jsx    # Botón flotante de feedback
│   │   │   ├── ResourcePage.jsx      # Componente genérico CRUD
│   │   │   └── UnitSidebar.jsx       # Sidebar con acordeones por unidad
│   │   └── pages/                 # 38 páginas
│   │       ├── di/                # 6 páginas DI
│   │       ├── je/                # 5 páginas JE
│   │       ├── jt/                # 4 páginas JT
│   │       ├── jupre/             # 4 páginas JUPRE
│   │       └── jus/               # 5 páginas JUS
│   └── vercel.json                # Config de despliegue en Vercel
│
└── README.md
```

## Unidades Organizativas

| Código | Nombre | Color | Icono | Plan Estratégico |
|--------|--------|-------|-------|------------------|
| DI | Dirección de Infraestructura | `#1565c0` | Engineering | Plan Estratégico de Infraestructura |
| JE | Jefatura de Energía | `#2e7d32` | ElectricBolt | Plan Estratégico de Energía y Electrificación |
| JT | Jefatura de Transporte | `#e65100` | DirectionsCar | Plan Estratégico de Transporte y Vialidad |
| JUPRE | Jefatura de Prevención Riesgos y Emergencias | `#6a1b9a` | Warning | Plan de Prevención y Gestión de Riesgos |
| JUS | Jefatura de Unidad de Saneamiento | `#c62828` | WaterDrop | Plan de Saneamiento Básico y Gestión Ambiental |

## Modelos de Base de Datos

### Modelos Base
| Modelo | Descripción | Campos clave |
|--------|-------------|--------------|
| `Proyecto` | Proyectos de obra pública | codigoSisin, nombre, tipo, coordenadas, presupuestoTotal, avanceFisico, avanceFinanciero, empresaId, supervisorId, inspectorId, unidadResponsable |
| `AvanceObra` | Reportes de avance con fotos georeferenciadas | numeroReporte, avanceFisicoParcial/Acumulado, fotos[] (con EXIF + verificación), estado |
| `Empresa` | Empresas constructoras | nombre, NIT, representanteLegal, especialidades, categoria, registroSICOPI |
| `PersonaTecnica` | Supervisores, inspectores, fiscales | nombreCompleto, CI, profesion, matriculaProfesional, rol, especialidad, unidadAsignada |
| `HitoPresupuestario` | Hitos de pago por avance | proyectoId, avanceFisicoMinimo, montoAsociado, estado |
| `Desembolso` | Registro de pagos | proyectoId, hitoId, monto, estado, comprobantePago |
| `Usuario` | Usuarios del sistema | nombre, email, password, rol, unidadesAcceso, activo, intentosFallidos, bloqueadoHasta |
| `Feedback` | Retroalimentación de usuarios | tipo, titulo, descripcion, pagina, prioridad, estado, usuarioId, respuesta |
| `UnidadOrganizativa` | Unidades organizativas | nombre, codigo, descripcion, color, icono, planEstrategico |

### Modelos DI (Dirección de Infraestructura)
| Modelo | Descripción |
|--------|-------------|
| `PlanMaestro` | Planes maestros de obras públicas |
| `PAC` | Plan Anual de Contrataciones |
| `DiagnosticoNecesidades` | Diagnóstico de necesidades sectoriales |
| `PortafolioProyecto` | Fichas técnicas, pre-inversión, diseño final |
| `ProgramacionEjecucion` | Ejecución física y financiera por trimestre |
| `PresupuestoBase` | Presupuesto base y flujos de efectividad |

### Modelos JE (Jefatura de Energía)
| Modelo | Descripción |
|--------|-------------|
| `DiagnosticoEnergetico` | Diagnóstico energético departamental |
| `RedElectrica` | Inventario de redes eléctricas |
| `ProyectoEnergiaRenovable` | Proyectos de energías renovables |
| `EficienciaEnergetica` | Eficiencia energética en edificios públicos |
| `SolicitudFinanciamiento` | Solicitudes BID, CAF, Banco Mundial |

### Modelos JT (Jefatura de Transporte)
| Modelo | Descripción |
|--------|-------------|
| `RedVial` | Inventario de red vial |
| `LicenciaVehiculo` | Licencias de vehículos públicos |
| `MantenimientoVial` | Mantenimiento vial y rutinario |
| `PlanMovilidad` | Plan integral de movilidad urbana y rural |

### Modelos JUPRE (Prevención Riesgos y Emergencias)
| Modelo | Descripción |
|--------|-------------|
| `MapaRiesgo` | Mapas de riesgos y amenazas |
| `PlanContingencia` | Plan de contingencia y respuesta |
| `SistemaAlerta` | Sistemas de alerta temprana |
| `CapacitacionSimulacro` | Capacitación y simulacros |

### Modelos JUS (Saneamiento)
| Modelo | Descripción |
|--------|-------------|
| `RedAguaPotable` | Redes de agua potable |
| `PlantaTratamiento` | Plantas de tratamiento |
| `GestionResiduos` | Gestión de residuos sólidos (GIRS) |
| `PlanCoberturaSaneamiento` | Plan de cobertura y acceso a saneamiento |
| `GestionAmbiental` | EIA, auditorías, monitoreo ambiental |

## Endpoints de la API

Base URL: `http://localhost:5001/api`

### Públicos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api` | Health check |

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login email/password |
| POST | `/api/auth/cambiar-password` | Cambiar contraseña |
| GET | `/api/auth/me` | Perfil del usuario actual |
| POST | `/api/auth/logout` | Cerrar sesión |

### Gestión de Usuarios (solo ADMIN)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/gestion/usuarios` | Listar usuarios |
| GET | `/api/gestion/usuarios/:id` | Usuario por ID |
| POST | `/api/gestion/usuarios` | Crear usuario |
| PUT | `/api/gestion/usuarios/:id` | Actualizar usuario |
| PUT | `/api/gestion/usuarios/:id/activar` | Activar/desactivar |
| DELETE | `/api/gestion/usuarios/:id` | Eliminar usuario |
| GET | `/api/gestion/usuarios/stats` | Estadísticas de usuarios |

### Gestión de Unidades
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/unidades` | Listar unidades |
| POST | `/api/unidades` | Crear unidad |
| PUT | `/api/unidades/:id` | Actualizar unidad |
| DELETE | `/api/unidades/:id` | Eliminar unidad |

### Gestión General (con permisos granulares)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| CRUD | `/api/gestion/proyectos` | Proyectos de obra |
| CRUD | `/api/gestion/empresas` | Empresas constructoras |
| CRUD | `/api/gestion/personas-tecnicas` | Personas técnicas |
| CRUD | `/api/gestion/hitos` | Hitos presupuestarios |
| CRUD | `/api/gestion/desembolsos` | Desembolsos |

### Gestión por Unidad (con filtro unitAccessMiddleware)
| Unidad | Endpoints |
|--------|-----------|
| DI | `/api/gestion/plan-maestro`, `/api/gestion/pac`, `/api/gestion/diagnosticos-necesidades`, `/api/gestion/portafolio-proyectos`, `/api/gestion/programaciones-ejecucion`, `/api/gestion/presupuestos-base` |
| JE | `/api/gestion/diagnosticos-energeticos`, `/api/gestion/red-electrica`, `/api/gestion/proyectos-energia-renovable`, `/api/gestion/eficiencias-energeticas`, `/api/gestion/solicitudes-financiamiento` |
| JT | `/api/gestion/red-vial`, `/api/gestion/licencias-vehiculo`, `/api/gestion/mantenimiento-vial`, `/api/gestion/planes-movilidad` |
| JUPRE | `/api/gestion/mapas-riesgo`, `/api/gestion/planes-contingencia`, `/api/gestion/sistemas-alerta`, `/api/gestion/capacitaciones-simulacros` |
| JUS | `/api/gestion/red-agua-potable`, `/api/gestion/plantas-tratamiento`, `/api/gestion/gestion-residuos`, `/api/gestion/planes-cobertura-saneamiento`, `/api/gestion/gestiones-ambientales` |

### Avances (con permisos granulares)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/avances` | Listar avances |
| GET | `/api/avances/:id` | Avance por ID |
| POST | `/api/avances/upload` | Subir foto con verificación EXIF + GPS |
| POST | `/api/avances` | Crear reporte de avance |
| PUT | `/api/avances/:id` | Actualizar avance |
| PUT | `/api/avances/:id/aprobar` | Aprobar avance (ADMIN/SUPERVISOR) |
| PUT | `/api/avances/:id/observar` | Observar avance (ADMIN/SUPERVISOR) |
| GET | `/api/avances/stats` | Estadísticas de avances |

### Feedback (requiere JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/feedback` | Listar feedbacks |
| GET | `/api/feedback/stats` | Estadísticas |
| GET | `/api/feedback/:id` | Feedback por ID |
| POST | `/api/feedback` | Crear feedback |
| PUT | `/api/feedback/:id` | Responder/cambiar estado |

## Páginas del Frontend

### Generales
| Página | Ruta | Descripción |
|--------|------|-------------|
| Login | `/login` | Autenticación email/password |
| Dashboard | `/` | Estadísticas, proyectos recientes |
| Proyectos | `/proyectos` | Lista con filtros por unidad/estado/tipo |
| ProyectoDetalle | `/proyectos/:id` | Detalle del proyecto |
| Avances | `/avances` | Lista con filtros |
| AvanceDetalle | `/avances/:id` | Detalle con fotos, aprobar/observar |
| RegistrarAvance | `/avances/nuevo` | Formulario + captura foto + GPS |
| Feedback | `/feedback` | Panel de feedback |

### Administración (ADMIN)
| Página | Ruta |
|--------|------|
| Usuarios | `/usuarios` |
| Unidades | `/unidades` |
| Empresas | `/empresas` |
| Personas Técnicas | `/personas-tecnicas` |
| Hitos | `/hitos` |

### Por Unidad - DI
| Página | Ruta |
|--------|------|
| Planes Maestros | `/di/planes-maestros` |
| Diagnóstico Necesidades | `/di/diagnostico-necesidades` |
| Portafolio Proyectos | `/di/portafolio-proyectos` |
| PAC | `/di/pac` |
| Programación Ejecución | `/di/programaciones-ejecucion` |
| Presupuesto Base | `/di/presupuestos-base` |

### Por Unidad - JE
| Página | Ruta |
|--------|------|
| Diagnóstico Energético | `/je/diagnostico-energetico` |
| Red Eléctrica | `/je/red-electrica` |
| Energías Renovables | `/je/proyectos-energia-renovable` |
| Eficiencia Energética | `/je/eficiencias-energeticas` |
| Solicitud Financiamiento | `/je/solicitudes-financiamiento` |

### Por Unidad - JT
| Página | Ruta |
|--------|------|
| Plan Movilidad | `/jt/planes-movilidad` |
| Red Vial | `/jt/red-vial` |
| Mantenimiento Vial | `/jt/mantenimiento-vial` |
| Licencias Vehículo | `/jt/licencias-vehiculo` |

### Por Unidad - JUPRE
| Página | Ruta |
|--------|------|
| Mapas de Riesgo | `/jupre/mapas-riesgo` |
| Plan Contingencia | `/jupre/planes-contingencia` |
| Sistemas Alerta | `/jupre/sistemas-alerta` |
| Capacitación/Simulacros | `/jupre/capacitaciones-simulacros` |

### Por Unidad - JUS
| Página | Ruta |
|--------|------|
| Red Agua Potable | `/jus/red-agua-potable` |
| Plantas Tratamiento | `/jus/plantas-tratamiento` |
| Gestión Residuos | `/jus/gestion-residuos` |
| Plan Cobertura | `/jus/planes-cobertura-saneamiento` |
| Gestión Ambiental | `/jus/gestiones-ambientales` |

## Componentes

| Componente | Descripción |
|------------|-------------|
| `FeedbackButton` | Botón flotante (FAB) para enviar feedback |
| `ResourcePage` | Componente genérico CRUD (tabla + formulario) reutilizable por los 24 recursos |
| `UnitSidebar` | Sidebar con acordeones colapsables por unidad, colores y filtrado por acceso |

## Sistema de Autenticación y Permisos

### Autenticación Local
- Login con email/password
- Bloqueo de cuenta tras 5 intentos fallidos (15 minutos)
- JWT con expiración configurable (default 8h)
- Cambio de contraseña desde el sistema

### Roles y Permisos Granulares

| Rol | Proyectos | Empresas | Personas | Hitos | Desembolsos | Avances | Usuarios | Unidades |
|-----|-----------|----------|----------|-------|-------------|---------|----------|----------|
| **ADMIN** | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD |
| **SUPERVISOR** | R | R | R | R | R | R, Aprobar, Observar | - | R |
| **INSPECTOR** | R | R | R | R | R | R, C, U | - | R |
| **FISCAL** | R | R | R | R | R | R | - | R |
| **VISOR** | R | R | R | R | R | R | - | R |

### Control de Acceso por Unidad
- `unitAccessMiddleware`: Filtra queries por `unidadesAcceso` del usuario
- `ADMIN` → acceso a todas las unidades (`'ALL'`)
- Otros roles → solo ven datos de sus unidades asignadas
- Sidebar filtra automáticamente items por unidades del usuario

### Middlewares
| Middleware | Descripción |
|------------|-------------|
| `authMiddleware` | Verifica JWT válido y usuario activo |
| `adminMiddleware` | Requiere rol ADMIN |
| `permissionMiddleware` | Verifica permisos granulares por recurso y acción |
| `unitAccessMiddleware` | Filtra acceso por unidades asignadas |
| `filterByUnit` | Aplica filtro `{ unidadResponsable: { $in: ... } }` a queries |
| `exifExtractor` | Extrae EXIF de fotos subidas |
| `geoVerification` | Verifica GPS de fotos vs ubicación de obra |

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
JWT_EXPIRES_IN=8h
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=https://sdop-azure.vercel.app
```

**Frontend (Vercel):**
```
VITE_API_URL=https://sdop.onrender.com/api
```

### Configuración de Build
- `backend/.npmrc`: `legacy-peer-deps=true` (resuelve conflicto cloudinary v2 vs multer-storage-cloudinary)
- `backend/src/config/db.js`: Reconnect automático en lugar de `process.exit(1)`
- `backend/src/app.js`: `app.set('trust proxy', 1)` para HTTPS detrás de proxy de Render

## Comandos de Desarrollo

### Backend
```bash
cd backend
npm install
npm run dev        # nodemon con hot reload (puerto 5001)
npm start          # node sin hot reload
npm run seed       # sembrar datos de prueba
npm test           # ejecutar tests con Jest
npm run test:watch # tests en modo watch
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # Vite dev server (puerto 5174)
npm run build        # Build de producción
npm run preview      # Preview del build
```

## Usuarios de Prueba (seed)

| Email | Password | Rol | Unidades |
|-------|----------|-----|----------|
| `admin@sdop.bo` | `Admin123!` | ADMIN | Todas |
| `ftorrez@sdop.bo` | `Supervisor123!` | SUPERVISOR | JT, DI |
| `phuanca@sdop.bo` | `Inspector123!` | INSPECTOR | JUS |
| `dcondori@sdop.bo` | `Fiscal123!` | FISCAL | Todas |
| `visor@sdop.bo` | `Visor123!` | VISOR | DI |

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

## Tests

### Suite de Autenticación (15 tests)
| Test | Resultado |
|------|-----------|
| Login exitoso con credenciales correctas | ✅ |
| Login falla con email incorrecto | ✅ |
| Login falla con contraseña incorrecta | ✅ |
| Login falla con campos vacíos | ✅ |
| Login falla sin enviar body | ✅ |
| Cuenta desactivada no puede login | ✅ |
| Email case-insensitive | ✅ |
| Token JWT contiene id, rol y unidadesAcceso | ✅ |
| Cuenta se bloquea tras 5 intentos fallidos | ✅ |
| Obtiene perfil con token válido | ✅ |
| Sin token retorna 401 | ✅ |
| Token inválido retorna 401 | ✅ |
| Cambio de contraseña exitoso | ✅ |
| Cambio falla con contraseña actual incorrecta | ✅ |
| Logout exitoso con token válido | ✅ |

## Notas Importantes

1. **Independencia de CONALJUVE**: Este proyecto es completamente independiente. No comparte código con CONALJUVE pero reutiliza los mismos servicios (MongoDB Atlas, Cloudinary) con configuraciones separadas.

2. **Autenticación local**: Se reemplazó Google OAuth por autenticación email/password con JWT. Los usuarios son creados por el ADMIN desde el panel de usuarios.

3. **Captura híbrida**: El componente `RegistrarAvance` permite tanto tomar foto en vivo como adjuntar desde galería. En ambos casos se captura el GPS del navegador. El EXIF se extrae en el frontend y se envía como fallback al backend.

4. **Geolocalización**: Requiere HTTPS en producción para que `navigator.geolocation` funcione correctamente.

5. **Cloudinary**: Las fotos se guardan en la carpeta `sdop/avances`. Cloudinary elimina metadatos EXIF, por eso se extraen en el frontend antes de subir.

6. **MongoDB**: Usa la misma cluster que CONALJUVE pero con base de datos separada `sdop_gestion`.

7. **Orden de rutas**: Las rutas específicas (`/stats`) deben ir ANTES que las dinámicas (`/:id`) en Express.

8. **Trust proxy**: `app.set('trust proxy', 1)` es necesario en Render para que Express detecte HTTPS correctamente.

9. **Reconexión MongoDB**: El backend no se cierra si falla la conexión a MongoDB; reintenta cada 5 segundos.

10. **Siembra de datos**: `backend/src/seed.js` crea 5 unidades, 5 usuarios, 28 proyectos, 5 empresas, 6 personas técnicas, ~110 hitos, 7 feedbacks y datos de prueba para los 9 nuevos modelos por unidad.

11. **Permisos granulares**: Implementados mediante `permissionMiddleware.js` con matriz centralizada de permisos por rol y recurso.

12. **Sidebar dinámico**: El `UnitSidebar` construye el menú basado en las unidades asignadas al usuario. ADMIN ve todas las unidades, otros roles solo las suyas.

13. **Componente genérico**: `ResourcePage.jsx` maneja CRUD para los 24 recursos específicos de unidad, reduciendo código repetido.
