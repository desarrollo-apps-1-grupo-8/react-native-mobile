import api from '@/services/api';
import { useNavigation } from '@react-navigation/native';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
 
export default function ResetPasswordScreen({ route }: { route: { params: { email: string } } }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { email } = route.params;
  const navigate = useNavigation<any>();
 
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
      await api.post('/reset-password', {
        email,
        newPassword: password,
      });
 
      Alert.alert('Éxito', 'Contraseña actualizada.');
      navigate.navigate('Login');
    } catch (error) {
      if (isAxiosError(error)) {
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
<View style={styles.inputGroup}>
<Text style={styles.label}>Nueva contraseña</Text>
<TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
</View>
<View style={styles.inputGroup}>
<Text style={styles.label}>Confirmar contraseña</Text>
<TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#666"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
</View>
 
      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleResetPassword} 
        disabled={loading}
>
        {loading ? 
<ActivityIndicator color="#000" /> : 
<Text style={styles.loginButtonText}>Restablecer</Text>
        }
</TouchableOpacity>
</View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9BA1A6',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    color: 'white',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'transparent',
    color: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  loginButtonText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 18,
  },
});