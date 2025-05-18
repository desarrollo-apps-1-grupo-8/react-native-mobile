import OTPVerification from '@/components/otp/OTPVerification';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

// Registro basico
export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);

  const handleRegister = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa un email');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowOTP(true); // Muestra el componente OTP
    }, 1000);
  };

  if (showOTP) {
    return (
      <OTPVerification
        email={email}
        isPasswordRecovery={false}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro mínimo</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Registrando...' : 'Registrarse'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: 'white',
    padding: 12,
    borderRadius: 6,
    width: '100%',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#00bcd4',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 