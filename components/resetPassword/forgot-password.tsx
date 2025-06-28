import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import OTPVerification from '../otp/OTPVerification';
 
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
 
  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresá tu email.');
      return;
    }
 
    setLoading(true);
    // Let OTPVerification component handle sending the code
    setShowOtp(true);
    setLoading(false);
  };
 
  if (showOtp) {
    return <OTPVerification email={email.trim().toLowerCase()} isPasswordRecovery />
  }
 
  return (
<View style={styles.container}>
<Text style={styles.title}>Recuperar contraseña</Text>
<Text style={styles.subtitle}>Ingresá tu email para recibir un código</Text>
<View style={styles.inputGroup}>
<Text style={styles.label}>Email</Text>
<TextInput
          style={styles.input}
          placeholder="correo@mail.com"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
</View>
 
      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleSendCode} 
        disabled={loading}
>
        {loading ? 
<ActivityIndicator color="#000" /> : 
<Text style={styles.loginButtonText}>Enviar código</Text>
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