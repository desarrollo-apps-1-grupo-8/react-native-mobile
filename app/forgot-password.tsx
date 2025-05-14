import axios from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresá tu email.');
      return;
    }

    setLoading(true);
    try {
        await axios.post('/api/v1/send-verification-code', {   ////////////////////////////////////////////
        email: email.trim().toLowerCase(),
      });

      Alert.alert('Éxito', 'El código fue enviado a tu correo.'); 
      router.push({ pathname: '/verify-code', params: { email: email.trim().toLowerCase() } });

    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        Alert.alert('Error', error.response?.data?.message || 'Ocurrió un error al enviar el código.');
      } else {
        Alert.alert('Error', 'Ocurrió un error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.button} onPress={handleSendCode} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enviar código</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff',
  },
  title: {
    fontSize: 24, marginBottom: 24, fontWeight: 'bold', textAlign: 'center',
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