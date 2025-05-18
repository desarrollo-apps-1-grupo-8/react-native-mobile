import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface OTPVerificationProps {
  email: string;
  onVerify: (code: string) => Promise<void>;
  onResendCode: () => Promise<void>;
}

export default function OTPVerification({ email, onVerify, onResendCode }: OTPVerificationProps) {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const checkCooldown = async () => {
      const last = await AsyncStorage.getItem('otp_last_resend');
      if (last) {
        // Se setea el tiempo de espera para reenviar el codigo
        const diff = 60 - Math.floor((Date.now() - Number(last)) / 1000);
        if (diff > 0) { 
          setResendDisabled(true);
          setCountdown(diff);
        }
      }
    };
    checkCooldown();
  }, []);

  useEffect(() => {
    if (resendDisabled && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendDisabled && countdown === 0) {
      setResendDisabled(false);
    }
  }, [resendDisabled, countdown]);

  const handleCodeChange = (text: string, index: number) => {
    // Validamos que solo sean números
    if (text && !/^\d+$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Avanzamos al siguiente input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Retrocedemos al input anterior cuando borramos
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const completeCode = code.join('');
    if (completeCode.length !== 6) {
      Alert.alert('Error', 'Por favor ingresá el código completo de 6 dígitos');
      return;
    }

    try {
      setLoading(true);
      await onVerify(completeCode);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo verificar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendDisabled) return;
    const now = Date.now();
    await AsyncStorage.setItem('otp_last_resend', now.toString());
    setResendDisabled(true);
    setCountdown(60);
    try {
      await onResendCode();
      Alert.alert('Éxito', 'Se ha enviado un nuevo código a tu correo');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo reenviar el código');
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Verificar código</Text>
        
        <Text style={styles.subtitle}>
          Hemos enviado un código de verificación a
        </Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.iconContainer}>
          <Image
            source="https://cdn-icons-png.flaticon.com/512/561/561127.png"
            style={styles.emailIcon}
            contentFit="contain"
            transition={300}
            placeholder="✉️"
          />
        </View>

        <Text style={styles.instructions}>
          Ingresá el código de 6 dígitos enviado a tu correo para restablecer tu contraseña
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={styles.codeInput}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectionColor="#00bcd4"
            />
          ))}
        </View>

        <Pressable 
          style={styles.button} 
          onPress={handleVerify} 
          disabled={loading || code.includes('')}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verificando...' : 'Verificar código'}
          </Text>
        </Pressable>

        <Pressable 
          onPress={handleResendCode} 
          disabled={resendDisabled}
          style={styles.resendContainer}
        >
          <Text style={[
            styles.resendText,
            resendDisabled && { color: '#666' }
          ]}>
            ¿No recibiste el código? 
            {resendDisabled 
              ? ` Reenviar (${countdown}s)` 
              : ' Reenviar'
            }
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
  card: {
    backgroundColor: '#1c1c1c',
    borderRadius: 10,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  iconContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  emailIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#333',
    borderRadius: 32,
  },
  instructions: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 24,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  codeInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    width: 48,
    height: 56,
    textAlign: 'center',
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
  resendContainer: {
    marginTop: 24,
  },
  resendText: {
    color: '#00bcd4',
    fontSize: 14,
    textAlign: 'center',
  },
}); 