import api from '@/services/api';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface OTPVerificationProps {
  email: string;
}

type VerificationStatus = 'idle' | 'success' | 'error';

export default function OTPVerification({ email }: OTPVerificationProps) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const statusOpacity = useRef(new Animated.Value(0)).current;
  const inputScales = useRef(code.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    const checkCooldown = async () => {
      const last = await AsyncStorage.getItem('otp_last_resend');
      if (last) {
        const diff = 60 - Math.floor((Date.now() - Number(last)) / 1000);
        if (diff > 0) { 
          setResendDisabled(true);
          setCountdown(diff);
          return true;
        }
      }
      return false;
    };

    const initializeCode = async () => {
      const hasCooldown = await checkCooldown();
      if (!hasCooldown) {
        handleSendCode();
      }
    };

    initializeCode();
  }, []);

  useEffect(() => {
    if (resendDisabled && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendDisabled && countdown === 0) {
      setResendDisabled(false);
    }
  }, [resendDisabled, countdown]);

  const animateError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const animateStatus = (show: boolean) => {
    Animated.timing(statusOpacity, {
      toValue: show ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const animateInput = (index: number, focused: boolean) => {
    Animated.spring(inputScales[index], {
      toValue: focused ? 1.1 : 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const resetStatus = () => {
    setVerificationStatus('idle');
    setStatusMessage('');
    animateStatus(false);
  };

  const handleCodeChange = (text: string, index: number) => {
    if (text && !/^\d+$/.test(text)) return;

    resetStatus();
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (text && index === 5) {
      const completeCode = [...newCode].join('');
      if (completeCode.length === 6) {
        handleVerify(completeCode);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index-1] = '';
      setCode(newCode);
    }
  };

  const handleVerify = async (verificationCode: string) => {
    try {
      setLoading(true);
      resetStatus();
      
      const response = await api.post('/verify-code', { 
        email, 
        verificationCode: verificationCode,
        recoverPassword: false
      });

      if (response.data.success) {
        setVerificationStatus('success');
        setStatusMessage('Tu cuenta ha sido verificada correctamente');
        animateStatus(true);
        setTimeout(() => {
          navigation.navigate('Login' as never);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' as never }],
          });
        }, 1500);
      } else {
        setVerificationStatus('error');
        setStatusMessage('Código inválido');
        animateStatus(true);
        animateError();
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      setVerificationStatus('error');
      setStatusMessage(error.message || 'No se pudo verificar el código');
      animateStatus(true);
      animateError();
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (isResend = false) => {
    if (resendDisabled) return;
    
    try {
      if (isResend) {
        setResendDisabled(true);
        setCountdown(60);
        const now = Date.now();
        await AsyncStorage.setItem('otp_last_resend', now.toString());
      }
      
      const response = await api.post('/send-verification-code', { email, recoverPassword: false });
      
      if (response.data.success) {
        if (isResend) {
          setStatusMessage('Se ha enviado un nuevo código a tu correo');
          setCode(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      } else {
        throw new Error('No se pudo enviar el código');
      }
    } catch (error: any) {
      setStatusMessage(error.message || 'No se pudo enviar el código');
      if (isResend) {
        setResendDisabled(false);
        setCountdown(0);
      }
    }
  };

  const handleResendCode = () => handleSendCode(true);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name="shield" size={32} color="white" />
          </View>
          <Text style={styles.title}>Verificación en dos pasos</Text>
          <Text style={styles.subtitle}>
            Ingresá el código de 6 dígitos que enviamos a:
          </Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <Animated.View 
          style={[
            styles.codeContainer,
            { transform: [{ translateX: shakeAnimation }] }
          ]}
        >
          {code.map((digit, index) => (
            <Animated.View
              key={index}
              style={[
                { transform: [{ scale: inputScales[index] }] }
              ]}
            >
              <TextInput
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.codeInput,
                  digit && styles.codeInputFilled,
                  loading && styles.codeInputDisabled,
                  verificationStatus === 'success' && styles.codeInputSuccess,
                  verificationStatus === 'error' && styles.codeInputError
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => animateInput(index, true)}
                onBlur={() => animateInput(index, false)}
                keyboardType="number-pad"
                maxLength={1}
                selectionColor="white"
                editable={!loading && verificationStatus !== 'success'}
              />
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.Text 
          style={[
            styles.statusMessage,
            verificationStatus === 'success' && styles.statusMessageSuccess,
            verificationStatus === 'error' && styles.statusMessageError,
            { opacity: statusOpacity }
          ]}
        >
          {statusMessage}
        </Animated.Text>

        <View style={styles.footer}>
          <Pressable 
            style={[styles.resendButton, resendDisabled && styles.resendButtonDisabled]} 
            onPress={handleResendCode}
            disabled={resendDisabled || loading || verificationStatus === 'success'}
          >
            <Text style={[styles.resendButtonText, resendDisabled && styles.resendButtonTextDisabled]}>
              {resendDisabled 
                ? `Reenviar código en ${countdown}s` 
                : 'Reenviar código'}
            </Text>
          </Pressable>

          <Text style={styles.helpText}>
            ¿No recibiste el código? Revisá tu carpeta de spam
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  codeInput: {
    width: 45,
    height: 56,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 12,
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: 'transparent',
    fontWeight: '600',
  },
  codeInputFilled: {
    borderColor: '#666',
    backgroundColor: '#222',
  },
  codeInputDisabled: {
    opacity: 0.5,
  },
  codeInputSuccess: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  codeInputError: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#222',
    marginBottom: 16,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  resendButtonTextDisabled: {
    color: '#999',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    marginTop: -24,
  },
  statusMessageSuccess: {
    color: '#22c55e',
  },
  statusMessageError: {
    color: '#ef4444',
  },
});