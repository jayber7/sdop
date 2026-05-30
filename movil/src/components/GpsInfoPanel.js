import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

function fmtLat(v) {
  if (v == null) return '—';
  return `S ${Math.abs(v).toFixed(6)}°`;
}

function fmtLng(v) {
  if (v == null) return '—';
  return `O ${Math.abs(v).toFixed(6)}°`;
}

const GpsInfoPanel = ({ coordExif, coordNavegador, coordProyecto, distancia, radioPermitido, estado }) => {
  const isVerified = estado === 'VERIFICADO';
  const distColor = isVerified ? colors.success : colors.warning;

  return (
    <View style={[styles.card, { borderColor: isVerified ? 'rgba(0,219,180,0.2)' : colors.border }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={styles.headerIcon}>📍</Text>
        <Text style={styles.headerText}>GEOLOCALIZACIÓN DEL AVANCE</Text>
        {estado && (
          <View style={[styles.chip, { backgroundColor: isVerified ? 'rgba(0,219,180,0.15)' : 'rgba(255,180,0,0.15)' }]}>
            <Text style={[styles.chipText, { color: isVerified ? colors.success : colors.warning }]}>{estado}</Text>
          </View>
        )}
      </View>

      <View style={styles.row}>
        <View style={[styles.column, { borderColor: coordExif ? 'rgba(0,219,180,0.1)' : 'rgba(255,255,255,0.03)' }]}>
          <Text style={styles.label}>📷 GPS de la Foto (EXIF)</Text>
          {coordExif ? (
            <>
              <Text style={styles.coord}>{fmtLat(coordExif.lat)}, {fmtLng(coordExif.lng)}</Text>
              {coordExif.alt != null && <Text style={styles.sub}>Altitud: {Math.round(coordExif.alt)}m</Text>}
            </>
          ) : (
            <Text style={styles.warning}>Sin datos GPS en la foto</Text>
          )}
        </View>
        <View style={[styles.column, { borderColor: 'rgba(91,154,255,0.1)' }]}>
          <Text style={styles.label}>🎯 Ubicación del Proyecto</Text>
          {coordProyecto ? (
            <Text style={styles.coord}>{fmtLat(coordProyecto.lat)}, {fmtLng(coordProyecto.lng)}</Text>
          ) : (
            <Text style={styles.muted}>Sin coordenadas</Text>
          )}
        </View>
      </View>

      {distancia != null && coordProyecto && (
        <View style={[styles.distBar, { backgroundColor: isVerified ? 'rgba(0,219,180,0.06)' : 'rgba(255,180,0,0.06)', borderColor: isVerified ? 'rgba(0,219,180,0.12)' : 'rgba(255,180,0,0.12)' }]}>
          <View style={styles.distRow}>
            <Text style={styles.distLabel}>Distancia</Text>
            <Text style={[styles.distValue, { color: distColor }]}>{distancia}m</Text>
            <View>
              <Text style={styles.distSub}>Radio permitido</Text>
              <Text style={styles.distRadio}>{radioPermitido || 500}m</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  headerIcon: { fontSize: 16, marginRight: 8 },
  headerText: {
    color: 'rgba(150,220,255,0.85)',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.6,
    flex: 1,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  chipText: { fontWeight: '700', fontSize: 11 },
  row: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
  },
  column: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  label: {
    color: colors.textMuted,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  coord: {
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  sub: { color: colors.textMuted, fontSize: 9, marginTop: 2 },
  warning: { color: 'rgba(255,200,0,0.6)', fontSize: 11, fontStyle: 'italic' },
  muted: { color: colors.textMuted, fontSize: 11, fontStyle: 'italic' },
  distBar: {
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distLabel: {
    color: colors.textMuted,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  distValue: {
    fontWeight: '800',
    fontSize: 20,
    fontFamily: 'monospace',
  },
  distSub: {
    color: colors.textMuted,
    fontSize: 9,
    textAlign: 'right',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  distRadio: {
    color: 'rgba(150,200,255,0.7)',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'right',
  },
});

export default GpsInfoPanel;
