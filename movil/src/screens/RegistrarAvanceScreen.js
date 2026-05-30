import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Image,
  StyleSheet, ActivityIndicator, Alert, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';
import api from '../api';
import GpsInfoPanel from '../components/GpsInfoPanel';
import GpsWarningModal from '../components/GpsWarningModal';

const CLIMA_OPTS = ['SOLEADO', 'NUBLADO', 'LLUVIA', 'GRANIZO', 'NIEBLA'];

function haversineDistance(coord1, coord2) {
  if (!coord1?.lat || !coord1?.lng || !coord2?.lat || !coord2?.lng) return null;
  const R = 6371e3;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const RegistrarAvanceScreen = ({ route, navigation }) => {
  const { proyecto } = route.params;
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gpsAlert, setGpsAlert] = useState({ visible: false, mensajes: [], pending: null });
  const [rawExif, setRawExif] = useState(null);
  const [exifOpen, setExifOpen] = useState(false);
  const [form, setForm] = useState({
    avanceFisicoParcial: '', avanceFisicoAcumulado: '',
    avanceFinancieroParcial: '', avanceFinancieroAcumulado: '',
    hitoDescripcion: '', actividadesRealizadas: '',
    problemasIdentificados: '', clima: 'SOLEADO',
  });

  useEffect(() => {
    getLocation();
    (async () => {
      const camPerm = await ImagePicker.requestCameraPermissionsAsync();
      const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!camPerm.granted || !libPerm.granted) {
        Alert.alert('Permisos', 'Se requieren permisos de cámara y galería');
      }
    })();
  }, []);

  useEffect(() => {
    if (locError) {
      Alert.alert('GPS', locError);
    }
  }, [locError]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocError('Permiso de ubicación denegado');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude, accuracy: loc.coords.accuracy });
    } catch (e) {
      setLocError('No se pudo obtener ubicación');
    }
  };

  const checkGpsValidity = (fotoData, exifLat) => {
    const msgs = [];
    const exif = fotoData.exif;
    const verif = fotoData.verificacion;

    if (exif && exif.tieneGPS === false && exif.dispositivo) {
      msgs.push('GPS no estaba activado al tomar la fotografía.');
    } else if (exif && exif.tieneGPS === false && !exif.dispositivo) {
      msgs.push('La imagen no contiene metadatos GPS.');
    } else if (!exifLat) {
      msgs.push('No se pudieron extraer metadatos de la imagen.');
    }

    if (!location && locError) {
      msgs.push(`Permisos de ubicación no concedidos: ${locError}`);
    } else if (!location && !locError) {
      msgs.push('No se pudo obtener la ubicación del dispositivo.');
    }

    if (verif?.distanciaObraMetros != null && proyecto?.coordenadas) {
      const radio = verif.radioAceptadoMetros || 500;
      if (verif.distanciaObraMetros > radio) {
        msgs.push(`Ubicación fuera del radio (${verif.distanciaObraMetros}m vs ${radio}m).`);
      }
    }

    return msgs;
  };

  const capturarFoto = async (desdeCamara) => {
    try {
      const options = { exif: true, quality: 0.8 };
      const result = desdeCamara
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled) return;

      const asset = result.assets[0];
      setUploading(true);
      setRawExif(asset.exif || {});
      setExifOpen(false);

      const exifNativo = asset.exif || {};
      const exifLat = exifNativo.GPSLatitude || exifNativo.latitude || null;
      const exifLng = exifNativo.GPSLongitude || exifNativo.longitude || null;
      const exifAlt = exifNativo.GPSAltitude || exifNativo.altitude || null;
      const exifDate = exifNativo.DateTimeOriginal || exifNativo.timestamp || null;
      const exifMake = exifNativo.Make || null;
      const exifModel = exifNativo.Model || null;

      const buildFD = () => {
        const fd = new FormData();
        fd.append('foto', {
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || `foto_${Date.now()}.jpg`,
        });
        fd.append('categoria', 'VISTA_GENERAL');
        if (location) {
          fd.append('browserGpsLat', String(location.lat));
          fd.append('browserGpsLng', String(location.lng));
        }
        if (proyecto?.coordenadas)
          fd.append('proyectoCoords', JSON.stringify(proyecto.coordenadas));
        if (exifLat) fd.append('exifLat', exifLat.toString());
        if (exifLng) fd.append('exifLng', exifLng.toString());
        if (exifAlt) fd.append('exifAlt', exifAlt.toString());
        if (exifDate) {
          const d = new Date(exifDate);
          if (!isNaN(d.getTime()) && d.getFullYear() >= 1000 && d.getFullYear() <= 9999)
            fd.append('exifDate', d.toISOString());
        }
        if (exifMake) fd.append('exifMake', exifMake);
        if (exifModel) fd.append('exifModel', exifModel);
        fd.append('exifRaw', JSON.stringify(asset.exif || {}));
        return fd;
      };

      const processResult = (data) => {
        const fotoData = data.data || data;
        if (!fotoData.exif?.tieneGPS && exifLat) {
          fotoData.exif = {
            latitud: Number(exifLat), longitud: Number(exifLng),
            altitud: exifAlt ? Number(exifAlt) : null,
            fechaCaptura: exifDate ? new Date(exifDate) : null,
            dispositivo: exifMake, modeloCamara: exifModel,
            tieneGPS: true,
          };
        }
        setFotos((prev) => [...prev, { ...fotoData, uri: asset.uri }]);
        const warnings = checkGpsValidity(fotoData, exifLat);
        if (warnings.length > 0)
          setGpsAlert({ visible: true, mensajes: warnings, pending: fotoData });
      };

      const token = await AsyncStorage.getItem('@sdop_token');
      const baseURL = api.defaults.baseURL;
      const errores = [];

      // E1: Axios FormData, timeout 30s
      try {
        const res = await api.post('/avances/upload', buildFD(), { timeout: 30000 });
        return processResult(res.data);
      } catch (e1) {
        errores.push(`Axios: ${(e1.message || '').slice(0, 60)}`);
      }

      // E2: XMLHttpRequest nativo, timeout 45s
      try {
        const res = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${baseURL}/avances/upload`);
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.timeout = 45000;
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300)
              resolve(JSON.parse(xhr.responseText));
            else
              reject(new Error(`HTTP ${xhr.status}`));
          };
          xhr.onerror = () => reject(new Error('XHR error'));
          xhr.ontimeout = () => reject(new Error('Timeout'));
          xhr.send(buildFD());
        });
        return processResult(res.data || res);
      } catch (e2) {
        errores.push(`XHR: ${(e2.message || '').slice(0, 60)}`);
      }

      // E3: Fetch API directa (sin timeout)
      try {
        const fd = buildFD();
        const res = await fetch(`${baseURL}/avances/upload`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return processResult(json.data || json);
      } catch (e3) {
        errores.push(`Fetch: ${(e3.message || '').slice(0, 60)}`);
      }

      Alert.alert('Error al subir foto', errores.join('\n'));
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message || 'Error al subir foto');
    } finally {
      setUploading(false);
    }
  };

  const removerFoto = (index) => setFotos((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (fotos.length === 0) {
      Alert.alert('Error', 'Debe tomar al menos una foto');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/avances', {
        proyectoId: proyecto._id,
        ...form,
        avanceFisicoParcial: parseFloat(form.avanceFisicoParcial),
        avanceFisicoAcumulado: parseFloat(form.avanceFisicoAcumulado),
        avanceFinancieroParcial: parseFloat(form.avanceFinancieroParcial),
        avanceFinancieroAcumulado: parseFloat(form.avanceFinancieroAcumulado),
        fotos: fotos.map((f) => ({
          url: f.url, publicId: f.publicId, exif: f.exif,
          verificacion: f.verificacion, categoria: f.categoria,
        })),
      });
      Alert.alert('Éxito', 'Avance registrado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Error al registrar');
    } finally {
      setSubmitting(false);
    }
  };

  const coordProyecto = proyecto?.coordenadas?.lat && proyecto?.coordenadas?.lng
    ? { lat: proyecto.coordenadas.lat, lng: proyecto.coordenadas.lng }
    : null;

  const ultimaFoto = fotos.length > 0 ? fotos[fotos.length - 1] : null;
  const coordExif = ultimaFoto?.exif?.tieneGPS && ultimaFoto.exif.latitud != null
    ? { lat: ultimaFoto.exif.latitud, lng: ultimaFoto.exif.longitud, alt: ultimaFoto.exif.altitud }
    : null;

  const distancia = location && coordProyecto
    ? haversineDistance({ lat: location.lat, lng: location.lng }, coordProyecto)
    : null;

  const estadoVerif = ultimaFoto?.verificacion?.estado || null;
  const radio = ultimaFoto?.verificacion?.radioAceptadoMetros || 500;

  return (
    <View style={styles.container}>
      {/* Fondo oscuro semitransparente si hay foto */}
      {ultimaFoto?.uri && <Image source={{ uri: ultimaFoto.uri }} style={styles.bgImage} blurRadius={40} />}

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Nuevo Avance</Text>
            <Text style={styles.headerSub}>{proyecto.nombre}</Text>
          </View>
        </View>

        {/* GPS Info */}
        {(location || coordExif) && (
          <GpsInfoPanel
            coordExif={coordExif}
            coordNavegador={location ? { lat: location.lat, lng: location.lng } : null}
            coordProyecto={coordProyecto}
            distancia={distancia}
            radioPermitido={radio}
            estado={estadoVerif}
          />
        )}

        {/* EXIF Raw */}
        {rawExif && (
          <View>
            {/* Summary */}
            <View style={styles.exifSummary}>
              <View style={styles.exifRow}>
                <Text style={styles.exifLabel}>📡 GPS en foto</Text>
                <Text style={[styles.exifValue, {
                  color: (rawExif.GPSLatitude || rawExif.latitude) ? colors.success : colors.warning
                }]}>
                  {(rawExif.GPSLatitude || rawExif.latitude) ? 'Detectado' : 'No detectado'}
                </Text>
              </View>
              {rawExif.GPSLatitude != null && rawExif.GPSLatitude !== 0 && (
                <View style={styles.exifRow}>
                  <Text style={styles.exifLabel}>Coordenadas</Text>
                  <Text style={styles.exifValue}>{Number(rawExif.GPSLatitude).toFixed(6)}, {Number(rawExif.GPSLongitude).toFixed(6)}</Text>
                </View>
              )}
              {location && (
                <View style={styles.exifRow}>
                  <Text style={styles.exifLabel}>🌐 GPS Navegador</Text>
                  <Text style={styles.exifValue}>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</Text>
                </View>
              )}
              <View style={styles.exifRow}>
                <Text style={styles.exifLabel}>📱 Dispositivo</Text>
                <Text style={styles.exifValue}>{(rawExif.Make || '?')} {(rawExif.Model || '')}</Text>
              </View>
              <View style={styles.exifRow}>
                <Text style={styles.exifLabel}>📅 Fecha toma</Text>
                <Text style={styles.exifValue}>{rawExif.DateTimeOriginal || rawExif.DateTimeDigitized || '?'}</Text>
              </View>
              {rawExif.ImageWidth && rawExif.ImageLength && (
                <View style={styles.exifRow}>
                  <Text style={styles.exifLabel}>📐 Resolución</Text>
                  <Text style={styles.exifValue}>{rawExif.ImageWidth} × {rawExif.ImageLength}</Text>
                </View>
              )}
            </View>
            {/* JSON toggle */}
            <TouchableOpacity style={styles.exifRawBtn} onPress={() => setExifOpen(!exifOpen)}>
              <Text style={styles.exifRawBtnText}>📄 Ver JSON completo EXIF {exifOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {exifOpen && (
              <View style={styles.exifRawBox}>
                <Text style={styles.exifRawText}>{JSON.stringify(rawExif, null, 2)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Botones de foto */}
        <View style={styles.photoRow}>
          <TouchableOpacity style={styles.photoBtn} onPress={() => capturarFoto(true)} disabled={uploading}>
            <Text style={styles.photoBtnIcon}>📷</Text>
            <Text style={styles.photoBtnText}>Tomar Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoBtn} onPress={() => capturarFoto(false)} disabled={uploading}>
            <Text style={styles.photoBtnIcon}>🖼️</Text>
            <Text style={styles.photoBtnText}>Adjuntar</Text>
          </TouchableOpacity>
        </View>

        {uploading && (
          <View style={styles.loadingBar}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={styles.loadingText}>Subiendo foto...</Text>
          </View>
        )}

        {/* Fotos tomadas */}
        {fotos.length > 0 && (
          <ScrollView horizontal style={styles.fotoStrip} showsHorizontalScrollIndicator={false}>
            {fotos.map((f, i) => (
              <View key={i} style={styles.fotoCard}>
                <Image source={{ uri: f.uri }} style={styles.fotoThumb} />
                <TouchableOpacity style={styles.deleteBtn} onPress={() => removerFoto(i)}>
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
                <View style={[styles.fotoChip, {
                  backgroundColor: f.verificacion?.estado === 'VERIFICADO'
                    ? 'rgba(0,219,180,0.15)' : 'rgba(255,180,0,0.15)',
                }]}>
                  <Text style={[styles.fotoChipText, {
                    color: f.verificacion?.estado === 'VERIFICADO' ? colors.success : colors.warning,
                  }]}>
                    {f.verificacion?.estado || 'PENDIENTE'}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Formulario */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Datos del Avance</Text>

          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Avance Físico Parcial (%)</Text>
              <TextInput style={styles.input} keyboardType="numeric"
                value={form.avanceFisicoParcial}
                onChangeText={(v) => setForm({ ...form, avanceFisicoParcial: v })} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Avance Físico Acumulado (%)</Text>
              <TextInput style={styles.input} keyboardType="numeric"
                value={form.avanceFisicoAcumulado}
                onChangeText={(v) => setForm({ ...form, avanceFisicoAcumulado: v })} />
            </View>
          </View>

          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Avance Financiero Parcial (%)</Text>
              <TextInput style={styles.input} keyboardType="numeric"
                value={form.avanceFinancieroParcial}
                onChangeText={(v) => setForm({ ...form, avanceFinancieroParcial: v })} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Avance Financiero Acumulado (%)</Text>
              <TextInput style={styles.input} keyboardType="numeric"
                value={form.avanceFinancieroAcumulado}
                onChangeText={(v) => setForm({ ...form, avanceFinancieroAcumulado: v })} />
            </View>
          </View>

          <Text style={styles.label}>Descripción del Hito</Text>
          <TextInput style={styles.input}
            value={form.hitoDescripcion}
            onChangeText={(v) => setForm({ ...form, hitoDescripcion: v })} />

          <Text style={styles.label}>Actividades Realizadas</Text>
          <TextInput style={[styles.input, styles.multiline]} multiline numberOfLines={3}
            value={form.actividadesRealizadas}
            onChangeText={(v) => setForm({ ...form, actividadesRealizadas: v })} />

          <Text style={styles.label}>Problemas Identificados</Text>
          <TextInput style={[styles.input, styles.multiline]} multiline numberOfLines={2}
            value={form.problemasIdentificados}
            onChangeText={(v) => setForm({ ...form, problemasIdentificados: v })} />

          <Text style={styles.label}>Clima</Text>
          <View style={styles.climaRow}>
            {CLIMA_OPTS.map((c) => (
              <TouchableOpacity key={c} style={[styles.climaBtn, form.clima === c && styles.climaActive]}
                onPress={() => setForm({ ...form, clima: c })}>
                <Text style={[styles.climaText, form.clima === c && styles.climaTextActive]}>
                  {c === 'SOLEADO' ? '☀️' : c === 'NUBLADO' ? '☁️' : c === 'LLUVIA' ? '🌧️' : c === 'GRANIZO' ? '🌨️' : '🌫️'} {c.charAt(0) + c.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}
            disabled={submitting || fotos.length === 0}>
            {submitting ? (
              <ActivityIndicator color="rgba(150,220,255,0.95)" />
            ) : (
              <Text style={styles.submitText}>Enviar Avance</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <GpsWarningModal
        visible={gpsAlert.visible}
        mensajes={gpsAlert.mensajes}
        onRetry={() => {
          setGpsAlert({ visible: false, mensajes: [], pending: null });
          removerFoto(fotos.length - 1);
        }}
        onContinue={() => setGpsAlert({ visible: false, mensajes: [], pending: null })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  bgImage: { ...StyleSheet.absoluteFillObject, opacity: 0.15 },
  scroll: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 48,
    marginBottom: 16,
  },
  back: { color: colors.primary, fontSize: 28 },
  headerTitle: { color: colors.text, fontWeight: '700', fontSize: 18 },
  headerSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  photoRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,150,255,0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,150,255,0.25)',
    paddingVertical: 14,
  },
  photoBtnIcon: { fontSize: 18 },
  photoBtnText: { color: 'rgba(150,220,255,0.9)', fontWeight: '600', fontSize: 13 },
  loadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: { color: colors.textMuted, fontSize: 12 },
  fotoStrip: { marginBottom: 12 },
  fotoCard: {
    marginRight: 8,
    position: 'relative',
  },
  fotoThumb: {
    width: 100,
    height: 80,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  deleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700' },
  exifSummary: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8, borderWidth: 1, borderColor: colors.border,
    padding: 10, marginBottom: 6,
  },
  exifRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  exifLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '600' },
  exifValue: { color: colors.textSecondary, fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  exifRawBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8, borderWidth: 1, borderColor: colors.border,
    paddingVertical: 8, paddingHorizontal: 12, marginBottom: 8,
  },
  exifRawBtnText: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  exifRawBox: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8, padding: 10, marginBottom: 8,
  },
  exifRawText: { color: colors.textSecondary, fontSize: 9, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  fotoChip: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  fotoChipText: { fontSize: 9, fontWeight: '700' },
  formCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'rgba(150,220,255,0.8)',
    fontWeight: '600',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  label: { color: colors.textMuted, fontSize: 11, marginBottom: 4, marginTop: 10 },
  input: {
    backgroundColor: colors.bgInput,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderInput,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  multiline: { minHeight: 60, textAlignVertical: 'top' },
  row2: { flexDirection: 'row', gap: 10 },
  climaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  climaBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.bgInput,
  },
  climaActive: {
    borderColor: 'rgba(0,150,255,0.4)',
    backgroundColor: 'rgba(0,150,255,0.12)',
  },
  climaText: { color: colors.textSecondary, fontSize: 11 },
  climaTextActive: { color: 'rgba(150,220,255,0.9)' },
  submitBtn: {
    backgroundColor: 'rgba(0,100,255,0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,150,255,0.3)',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: { color: 'rgba(150,220,255,0.95)', fontWeight: '700', fontSize: 15 },
});

export default RegistrarAvanceScreen;
