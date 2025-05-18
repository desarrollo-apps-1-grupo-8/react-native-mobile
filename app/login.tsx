//	Pantalla principal de login (UI y lógica)
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Función de login con control de errores
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completá todos los campos');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/login', { email, password });
      const data = response.data;

      if (!data.success) {
        if (data.status === 'NEEDS_VERIFICATION') {
          Alert.alert('Verificación requerida', 'Tu cuenta aún no fue verificada.');
        } else {
          Alert.alert('Error', 'Credenciales incorrectas.');
        }
        return;
      }

      const token = data.token;
      await AsyncStorage.setItem('token', token);
      router.replace('(tabs)/shipments');

    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>INICIAR SESIÓN</Text>

      <View style={styles.card}>
        <Text style={styles.welcome}>Bienvenido de nuevo</Text>
        <Text style={styles.subtitle}>Iniciá sesión para continuar</Text>

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="tuCorreo@mail.com"
          placeholderTextColor="#aaa"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordRow}>
          <Text style={styles.label}>Contraseña</Text>
          <Pressable onPress={() => Alert.alert('Función no disponible', 'La recuperación no está implementada.')}>
            <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
          </Pressable>
        </View>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Ingresando...' : 'Ingresar'}</Text>
        </Pressable>

        {/* Comentado porque la pantalla aún no está creada */}
        {/*
        <Pressable onPress={() => router.push('register')}>
          <Text style={styles.registerText}>
            ¿No tenés una cuenta? <Text style={{ textDecorationLine: 'underline' }}>Registrate</Text>
          </Text>
        </Pressable>
        */}
      </View>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  card: {
    backgroundColor: '#1c1c1c',
    borderRadius: 10,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  welcome: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: 'white',
    padding: 12,
    borderRadius: 6,
  },
  passwordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgot: {
    fontSize: 12,
    color: '#00bcd4',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#00bcd4',
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerText: {
    color: '#ccc',
    fontSize: 13,
    marginTop: 16,
    textAlign: 'center',
  },
});


