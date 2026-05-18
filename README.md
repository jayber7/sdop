# SDOP - Sistema de Gestión y Control de Obras Públicas

Secretaría Departamental de Obras Públicas - Gobierno Autónomo Departamental de Oruro

## Stack Tecnológico

### Frontend
- React 19 + Vite 6
- Material-UI (MUI) 7
- React Router 6
- Axios + exifr (EXIF extraction)
- React Leaflet (mapas)
- Recharts (gráficos)

### Backend
- Node.js + Express 5
- MongoDB Atlas (Mongoose 8)
- Google OAuth 2.0 + JWT
- Cloudinary (almacenamiento)
- Multer (upload de archivos)

## Estructura

```
SDOP/
├── backend/
│   ├── src/
│   │   ├── models/         # Proyecto, AvanceObra, Empresa, PersonaTecnica, etc.
│   │   ├── routes/         # authRoutes, gestionRoutes, avanceRoutes
│   │   ├── controllers/
│   │   └── middleware/     # auth, exifExtractor, geoVerification
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/          # Dashboard, Proyectos, Avances, RegistrarAvance, etc.
│   │   ├── components/
│   │   ├── contexts/       # AuthContext
│   │   └── services/       # API (axios)
│   └── package.json
└── README.md
```

## Funcionalidades

### 1. Gestión de Proyectos
- CRUD completo de proyectos de obra
- Tipos: Caminos, Puentes, Electrificación, Agua Potable, Saneamiento, Edificación
- Ubicación geográfica (coordenadas GPS)
- Presupuesto y fuente de financiamiento
- Asignación de empresa, supervisor, inspector

### 2. Registro de Avance con Evidencia Georeferencial (Híbrido)
- **Tomar foto** directamente desde la cámara del celular
- **Adjuntar foto** desde la galería del dispositivo
- Extracción automática de metadatos EXIF (si están disponibles)
- Captura de GPS del navegador (Geolocation API)
- Verificación cruzada: EXIF GPS vs Browser GPS vs Ubicación de la obra
- Detección de fotos recicladas o fuera de ubicación

### 3. Hitos Presupuestarios
- Definición de hitos con avance físico mínimo y monto asociado
- Vinculación con avances de obra
- Seguimiento de desembolsos

### 4. Registro de Empresas y Personas Técnicas
- Empresas constructoras habilitadas
- Supervisores, inspectores y fiscales
- Asignación a proyectos

## Desarrollo Local

### Backend
```bash
cd backend
cp .env.example .env  # configurar variables
npm install
npm run dev  # puerto 5001
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev  # puerto 5174
```

## Despliegue

- **Frontend**: Vercel
- **Backend**: Render o Koyeb
- **Base de datos**: MongoDB Atlas
- **Archivos**: Cloudinary

## Variables de Entorno

### Backend
```
NODE_ENV=production
PORT=5001
MONGO_URI=...
JWT_SECRET=...
SESSION_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=https://sdop.vercel.app
```

### Frontend
```
VITE_API_URL=https://sdop-backend.onrender.com/api
```
