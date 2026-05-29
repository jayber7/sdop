# SDOP - Sistema de Gestión y Control de Obras Públicas

Secretaría Departamental de Obras Públicas - Gobierno Autónomo Departamental de Oruro

## Stack Tecnológico

### Frontend
- React 19 + Vite 6
- Material-UI (MUI) 7
- React Router 6
- Axios + JWT
- exifr (extracción EXIF)
- React Leaflet (mapas)
- Recharts (gráficos)

### Backend
- Node.js + Express 5
- MongoDB Atlas (Mongoose 8)
- Autenticación local (email/password) + JWT
- Cloudinary (almacenamiento)
- Multer (upload de archivos)
- Jest + Supertest (tests)

## Estructura

```
SDOP/
├── backend/
│   ├── src/
│   │   ├── models/         # 33 modelos (Proyecto, AvanceObra, Empresa, + 24 por unidad)
│   │   ├── routes/         # authRoutes, usuarioRoutes, gestionRoutes, avanceRoutes, feedbackRoutes, unidadRoutes
│   │   ├── middleware/     # auth, permission, unitAccess, exifExtractor, geoVerification
│   │   └── seed.js         # Datos de prueba
│   └── tests/              # Tests de autenticación (15 tests)
── frontend/
│   ├── src/
│   │   ├── pages/          # 38 páginas (Dashboard, Proyectos, Avances, + 24 por unidad)
│   │   │   ├── di/         # 6 páginas DI (Planes Maestros, PAC, Portafolio, etc.)
│   │   │   ├── je/         # 5 páginas JE (Diagnóstico, Red Eléctrica, Renovables, etc.)
│   │   │   ├── jt/         # 4 páginas JT (Movilidad, Red Vial, Mantenimiento, etc.)
│   │   │   ├── jupre/      # 4 páginas JUPRE (Mapas, Contingencia, Alerta, etc.)
│   │   │   └── jus/        # 5 páginas JUS (Agua, Plantas, Residuos, etc.)
│   │   ├── components/     # ResourcePage (CRUD genérico), UnitSidebar, FeedbackButton
│   │   ├── config/         # unitMenus.js (configuración de menús por unidad)
│   │   ├── contexts/       # AuthContext
│   │   └── services/       # API (axios)
│   └── package.json
└── README.md
```

## Unidades Organizativas

| Código | Nombre | Color | Funcionalidades |
|--------|--------|-------|-----------------|
| **DI** | Dirección de Infraestructura | 🔵 Azul | Planes Maestros, PAC, Portafolio, Programación, Presupuesto |
| **JE** | Jefatura de Energía | 🟢 Verde | Diagnóstico Energético, Red Eléctrica, Renovables, Eficiencia, Financiamiento |
| **JT** | Jefatura de Transporte | 🟠 Naranja | Plan Movilidad, Red Vial, Mantenimiento, Licencias |
| **JUPRE** | Prevención Riesgos | 🟣 Morado | Mapas de Riesgo, Contingencia, Alerta Temprana, Simulacros |
| **JUS** | Saneamiento |  Rojo | Agua Potable, Plantas Tratamiento, Residuos, Cobertura, Ambiental |

## Funcionalidades

### 1. Autenticación y Permisos
- Login local con email/password
- Bloqueo tras 5 intentos fallidos (15 min)
- 5 roles: ADMIN, SUPERVISOR, INSPECTOR, FISCAL, VISOR
- Permisos granulares por recurso y acción
- Control de acceso por unidad organizativa

### 2. Gestión de Proyectos
- CRUD completo de proyectos de obra
- Tipos: Caminos, Puentes, Electrificación, Agua Potable, Saneamiento, Edificación
- Ubicación geográfica (coordenadas GPS)
- Presupuesto y fuente de financiamiento
- Asignación de empresa, supervisor, inspector
- Filtrado por unidad responsable

### 3. Registro de Avance con Evidencia Georeferencial (Híbrido)
- **Tomar foto** directamente desde la cámara del celular
- **Adjuntar foto** desde la galería del dispositivo
- Extracción automática de metadatos EXIF (si están disponibles)
- Captura de GPS del navegador (Geolocation API)
- Verificación cruzada: EXIF GPS vs Browser GPS vs Ubicación de la obra
- Detección de fotos recicladas o fuera de ubicación

### 4. Gestión por Unidad (24 recursos específicos)
- **DI**: Planes Maestros, Diagnóstico, Portafolio, PAC, Programación, Presupuesto
- **JE**: Diagnóstico Energético, Red Eléctrica, Renovables, Eficiencia, Financiamiento
- **JT**: Plan Movilidad, Red Vial, Mantenimiento, Licencias
- **JUPRE**: Mapas de Riesgo, Contingencia, Alerta, Simulacros
- **JUS**: Agua Potable, Plantas, Residuos, Cobertura, Ambiental

### 5. Hitos Presupuestarios
- Definición de hitos con avance físico mínimo y monto asociado
- Vinculación con avances de obra
- Seguimiento de desembolsos

### 6. Registro de Empresas y Personas Técnicas
- Empresas constructoras habilitadas
- Supervisores, inspectores y fiscales
- Asignación a proyectos

### 7. Gestión de Usuarios (ADMIN)
- CRUD de usuarios del sistema
- Asignación de rol y unidades de acceso
- Activación/desactivación de cuentas

## Desarrollo Local

### Backend
```bash
cd backend
cp .env.example .env  # configurar variables
npm install
npm run dev    # puerto 5001
npm run seed   # sembrar datos de prueba
npm test       # ejecutar tests
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev    # puerto 5174
npm run build  # build de producción
```

## Usuarios de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| `admin@sdop.bo` | `Admin123!` | ADMIN |
| `ftorrez@sdop.bo` | `Supervisor123!` | SUPERVISOR |
| `phuanca@sdop.bo` | `Inspector123!` | INSPECTOR |
| `dcondori@sdop.bo` | `Fiscal123!` | FISCAL |
| `visor@sdop.bo` | `Visor123!` | VISOR |

## Despliegue

- **Frontend**: Vercel
- **Backend**: Render
- **Base de datos**: MongoDB Atlas
- **Archivos**: Cloudinary

## Variables de Entorno

### Backend
```
NODE_ENV=production
PORT=5001
MONGO_URI=...
JWT_SECRET=...
JWT_EXPIRES_IN=8h
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=https://sdop.vercel.app
```

### Frontend
```
VITE_API_URL=https://sdop-backend.onrender.com/api
```
