import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

const GpsWarningModal = ({ visible, mensajes, onRetry, onContinue }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinue}>
    <View style={styles.overlay}>
      <View style={styles.dialog}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>⚠️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Advertencia de Verificación Geográfica</Text>
            <Text style={styles.subtitle}>La foto presenta problemas de geolocalización</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.motivoTitle}>Motivos detectados:</Text>
          {mensajes.map((msg, i) => (
            <View key={i} style={styles.msgRow}>
              <Text style={styles.msgBullet}>⚠️</Text>
              <Text style={styles.msgText}>{msg}</Text>
            </View>
          ))}
          <Text style={styles.footerText}>
            Puede continuar, pero el avance quedará marcado como{' '}
            <Text style={{ color: colors.warning, fontWeight: '700' }}>SOSPECHOSO</Text>.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnOutline} onPress={onRetry}>
            <Text style={styles.btnOutlineText}>📷 Reintentar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnWarn} onPress={onContinue}>
            <Text style={styles.btnWarnText}>Continuar de todas formas</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: 'rgba(10,14,39,0.96)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,180,0,0.2)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,180,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 18 },
  title: { color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: 14 },
  subtitle: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  body: { paddingHorizontal: 16, paddingBottom: 8 },
  motivoTitle: { color: 'rgba(255,200,0,0.8)', fontWeight: '600', fontSize: 11, marginBottom: 8 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  msgBullet: { fontSize: 12, marginTop: 1 },
  msgText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 17, flex: 1 },
  footerText: { color: colors.textMuted, fontSize: 10, marginTop: 8 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 8,
    gap: 8,
  },
  btnOutline: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  btnOutlineText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  btnWarn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,180,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,180,0,0.3)',
  },
  btnWarnText: { color: 'rgba(255,200,0,0.95)', fontWeight: '600', fontSize: 13 },
});

export default GpsWarningModal;
