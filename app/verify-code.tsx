import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function VerifyCodeScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyCode = async () => {
    if (!code || !email) {
      Alert.alert('Error', 'Faltan datos.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('verify-code', {    ////////////////////////////////////////////
        email,
        code,
      });

      Alert.alert('Éxito', 'Código verificado.');
      router.push({ pathname: '/reset-password', params: { email } });

    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Error', error.response?.data?.message || 'Código inválido o expirado.');
      } else {
        Alert.alert('Error', 'Error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verificar código</Text>
      <Text style={styles.subtitle}>Revisá tu correo ({email})</Text>

      <TextInput
        style={styles.input}
        placeholder="Código recibido"
        keyboardType="numeric"
        value={code}
        onChangeText={setCode}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerifyCode} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verificar</Text>}
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
    backgroundColor: '#28a745', padding: 14, borderRadius: 8, alignItems: 'center',
  },
  buttonText: {
    color: '#fff', fontWeight: 'bold',
  },
});