import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/v1/reset-password', {      ////////////////////////////////////////////
        email,
        newPassword: password,
      });

      Alert.alert('Éxito', 'Contraseña actualizada.');
      router.replace('/'); // redirige al login (o donde quieras)        //////////////////////////////

    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Error', error.response?.data?.message || 'No se pudo actualizar la contraseña.');
      } else {
        Alert.alert('Error', 'Error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva contraseña</Text>
      <Text style={styles.subtitle}>Correo: {email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Restablecer</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff',
  },
  title: {
    fontSize: 24, marginBottom: 16, fontWeight: 'bold', textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center', marginBottom: 24, color: '#555',
  },
  input: {
    borderWidth: 1, borderColor: '#aaa', padding: 12, borderRadius: 8, marginBottom: 16,
  },
  button: {
    backgroundColor: '#007bff', padding: 14, borderRadius: 8, alignItems: 'center',
  },
  buttonText: {
    color: '#fff', fontWeight: 'bold',
  },
});