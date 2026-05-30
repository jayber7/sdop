import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { colors } from '../theme';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const ProyectosScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [proyectos, setProyectos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProyectos();
  }, []);

  const loadProyectos = async () => {
    try {
      const res = await api.get('/gestion/proyectos', { params: { limit: 200 } });
      setProyectos(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = proyectos.filter(
    (p) =>
      p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      p.codigoInterno?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RegistrarAvance', { proyecto: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.codigo}>{item.codigoInterno || '—'}</Text>
        <View style={[styles.estadoBadge, { backgroundColor: item.estado === 'EJECUCION' ? 'rgba(0,219,180,0.15)' : 'rgba(91,154,255,0.15)' }]}>
          <Text style={[styles.estadoText, { color: item.estado === 'EJECUCION' ? colors.success : colors.primary }]}>
            {item.estado?.replace('_', ' ')}
          </Text>
        </View>
      </View>
      <Text style={styles.nombre}>{item.nombre}</Text>
      <Text style={styles.tipo}>{item.tipo?.replace('_', ' ')}</Text>
      <Text style={styles.unidad}>{item.unidadResponsable?.nombre || ''}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Seleccionar Proyecto</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Buscar proyecto..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 48,
  },
  topTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  logout: { color: colors.textMuted, fontSize: 13 },
  search: {
    backgroundColor: colors.bgInput,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderInput,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  codigo: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  estadoBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  estadoText: { fontSize: 10, fontWeight: '600' },
  nombre: { color: colors.text, fontWeight: '600', fontSize: 15, marginBottom: 2 },
  tipo: { color: colors.textSecondary, fontSize: 12, marginBottom: 2 },
  unidad: { color: colors.textMuted, fontSize: 11 },
});

export default ProyectosScreen;
