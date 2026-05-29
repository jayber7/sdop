import React from 'react';
import { Box, Typography } from '@mui/material';
import { Verified, LocationOn } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const styles = {
  wrapper: {
    position: 'relative',
    minHeight: '100vh',
    overflow: 'hidden',
  },
  bgImage: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: 'brightness(0.35) saturate(1.2)',
    zIndex: 0,
  },
  bgGradient: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, #0a0e27 0%, #1a1040 40%, #0d1b3e 70%, #0a0e27 100%)',
    zIndex: 0,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 100%)',
    zIndex: 1,
  },
  content: {
    position: 'relative',
    zIndex: 2,
    p: { xs: 1.5, md: 3 },
  },
  glassCard: {
    bgcolor: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 3,
    boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
  },
  glassCardStrong: {
    bgcolor: 'rgba(10,14,39,0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(100,180,255,0.15)',
    borderRadius: 2,
    boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(0,150,255,0.05)',
  },
  neonBorder: {
    border: '1px solid rgba(0,180,255,0.2)',
    boxShadow: '0 0 15px rgba(0,180,255,0.1), inset 0 0 15px rgba(0,180,255,0.03)',
  },
  sectionLabel: {
    color: 'rgba(100,200,255,0.7)',
    fontSize: '0.6rem',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontWeight: 700,
    mb: 0.5,
  },
  sectionValue: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
};

export default function VerificationReportLayout({
  children,
  backgroundImage,
  proyecto,
  usuario,
  avance,
  verificationCode,
  fecha,
  hora,
  unidadNombre,
  modo = 'registro',
}) {
  const hasBg = !!backgroundImage;
  const coords = proyecto?.coordenadas;
  const hasCoords = coords?.lat && coords?.lng;

  return (
    <Box sx={styles.wrapper}>
      {hasBg ? (
        <Box sx={{ ...styles.bgImage, backgroundImage: `url(${backgroundImage})` }} />
      ) : (
        <Box sx={styles.bgGradient} />
      )}
      <Box sx={styles.overlay} />

      <Box sx={styles.content}>
        <Box sx={styles.glassCard}>
          {/* ===== HEADER ROW ===== */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'auto 1fr auto' },
              gap: 2,
              p: 2,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* LEFT: Map */}
            <Box sx={{ width: { xs: '100%', md: 260 } }}>
              {hasCoords ? (
                <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <MapContainer
                    center={[coords.lat, coords.lng]}
                    zoom={16}
                    scrollWheelZoom={false}
                    style={{ height: 140, width: '100%' }}
                    zoomControl={false}
                    dragging={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[coords.lat, coords.lng]} icon={blueIcon}>
                      <Popup>{proyecto?.nombre}</Popup>
                    </Marker>
                  </MapContainer>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 140,
                    borderRadius: 2,
                    bgcolor: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed rgba(255,255,255,0.15)',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                    Sin coordenadas
                  </Typography>
                </Box>
              )}
              <Box sx={{ mt: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {hasCoords && (
                  <>
                    <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.7)', fontSize: '0.6rem' }}>
                      <LocationOn sx={{ fontSize: 10, mr: 0.3, verticalAlign: 'middle' }} />
                      {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                    </Typography>
                    {avance?.fotos?.[0]?.exif?.altitud && (
                      <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.7)', fontSize: '0.6rem' }}>
                        Alt: {Math.round(avance.fotos[0].exif.altitud)}m
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </Box>

            {/* CENTER: Institution */}
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: { xs: 'center', md: 'left' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Box
                  component="span"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: 'rgba(0,100,200,0.2)',
                    border: '1px solid rgba(0,150,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  <Verified sx={{ fontSize: 18, color: 'rgba(100,200,255,0.9)' }} />
                </Box>
                <Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.2 }}>
                    SDOP - ORURO
                  </Typography>
                  <Typography sx={{ color: 'rgba(100,200,255,0.6)', fontSize: '0.6rem', letterSpacing: '0.05em' }}>
                    Secretaría Departamental de Obras Públicas
                  </Typography>
                  {unidadNombre && (
                    <Typography sx={{ color: 'rgba(255,200,0,0.7)', fontSize: '0.65rem', fontWeight: 600, mt: 0.3 }}>
                      {unidadNombre}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Typography
                sx={{
                  mt: 1,
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}
              >
                Verificación de Avance de Obra
              </Typography>
            </Box>

            {/* RIGHT: Timemark branding */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Verified sx={{ fontSize: 14, color: 'rgba(0,220,180,0.9)' }} />
                <Typography sx={{ color: 'rgba(0,220,180,0.9)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                  Timemark
                </Typography>
              </Box>
              <Typography
                sx={{
                  color: 'rgba(0,220,180,0.5)',
                  fontSize: '0.55rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  border: '1px solid rgba(0,220,180,0.2)',
                  px: 0.8,
                  py: 0.15,
                  borderRadius: 1,
                }}
              >
                Foto 100% Real
              </Typography>
              {modo === 'detalle' && avance?.numeroReporte && (
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.55rem', mt: 0.5 }}>
                  #{avance.numeroReporte}
                </Typography>
              )}
            </Box>
          </Box>

          {/* ===== INFO BAR ===== */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
              gap: { xs: 1, md: 2 },
              px: 2,
              py: 1.5,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <Box>
              <Typography sx={styles.sectionLabel}>Agente</Typography>
              <Typography sx={styles.sectionValue}>{usuario?.nombre || '—'}</Typography>
            </Box>
            <Box>
              <Typography sx={styles.sectionLabel}>Fecha</Typography>
              <Typography sx={styles.sectionValue}>{fecha || '—'}</Typography>
            </Box>
            <Box>
              <Typography sx={styles.sectionLabel}>Hora</Typography>
              <Typography sx={styles.sectionValue}>{hora || '—'}</Typography>
            </Box>
            <Box>
              <Typography sx={styles.sectionLabel}>Proyecto</Typography>
              <Typography sx={{ ...styles.sectionValue, fontSize: '0.7rem' }}>{proyecto?.nombre || avance?.proyectoId?.nombre || '—'}</Typography>
            </Box>
          </Box>

          {/* ===== BODY (with verification code sidebar) ===== */}
          <Box sx={{ display: 'flex' }}>
            {/* Main content */}
            <Box sx={{ flex: 1, p: { xs: 1.5, md: 2 } }}>{children}</Box>

            {/* Verification code sidebar */}
            {verificationCode && (
              <Box
                sx={{
                  width: 36,
                  minHeight: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderLeft: '1px solid rgba(255,255,255,0.06)',
                  px: 0.5,
                  py: 1,
                  gap: 0.5,
                }}
              >
                <Typography
                  sx={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    color: 'rgba(0,220,180,0.25)',
                    fontSize: '0.5rem',
                    letterSpacing: '0.15em',
                    fontFamily: 'monospace',
                    fontWeight: 400,
                    lineHeight: 1.8,
                    userSelect: 'all',
                  }}
                >
                  {verificationCode}
                </Typography>
                <Box
                  sx={{
                    mt: 0.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.3,
                  }}
                >
                  <Verified sx={{ fontSize: 10, color: 'rgba(0,220,180,0.3)' }} />
                  <Typography
                    sx={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      color: 'rgba(0,220,180,0.3)',
                      fontSize: '0.45rem',
                      letterSpacing: '0.1em',
                      fontWeight: 600,
                    }}
                  >
                    Timemark Verified
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
