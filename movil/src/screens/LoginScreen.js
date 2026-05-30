import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const LoginScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Ingrese email y contraseña');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.logo}>🏗️</Text>
        <Text style={styles.title}>SDOP</Text>
        <Text style={styles.subtitle}>Sistema de Gestión de Obras Públicas</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="rgba(150,220,255,0.95)" />
            ) : (
              <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logo: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: { gap: 14 },
  input: {
    backgroundColor: colors.bgInput,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderInput,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },
  button: {
    backgroundColor: 'rgba(0,100,255,0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,150,255,0.3)',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'rgba(150,220,255,0.95)',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default LoginScreen;
