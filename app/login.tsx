//	Pantalla principal de login (UI y lógica)
import api from '@/services/api'; //importamos api aca de api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completá todos los campos');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/login', { email, password }); // aca se usa api del archivo api.ts

      const token = response.data.token;
      await AsyncStorage.setItem('token', token);
      console.log('Token recibido:', token);

      router.replace('/(tabs)'); // Reemplazá con la ruta correcta si tu home es diferente
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'Credenciales incorrectas o error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LOGIN</Text>

      <View style={styles.card}>
        <Text style={styles.welcome}>Welcome back</Text>
        <Text style={styles.subtitle}>Login to your account to continue</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="john@example.com"
          placeholderTextColor="#aaa"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordRow}>
          <Text style={styles.label}>Password</Text>
          <Pressable onPress={() => Alert.alert('Recuperación', 'Funcionalidad no implementada')}>
            <Text style={styles.forgot}>Forgot password?</Text>
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
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </Pressable>

        {/* Comentado porque todavía no existe la pantalla */}
        {/* 
        <Pressable onPress={() => router.push('register')}>
          <Text style={styles.registerText}>
            No tenes una cuenta? <Text style={{ textDecorationLine: 'underline' }}>Register</Text>
          </Text>
        </Pressable>
        */}
      </View>
    </View>
  );
}

// 🎨 Estilos
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

