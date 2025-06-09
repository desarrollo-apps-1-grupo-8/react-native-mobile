//	Pantalla principal de login (UI y lógica)
import { useSession } from '@/context/SessionContext';
import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import OTPVerification from '../otp/OTPVerification';

type ErrorType = {
  message: string;
  field?: 'email' | 'password' | 'general';
}

export default function LoginScreen() {
  const navigation = useNavigation<any>()
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<ErrorType | null>(null);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);

  // Animation references
  const shakeAnimationEmail = useRef(new Animated.Value(0)).current;
  const shakeAnimationPassword = useRef(new Animated.Value(0)).current;
  const shakeAnimationGeneral = useRef(new Animated.Value(0)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const borderAnimationEmail = useRef(new Animated.Value(0)).current;
  const borderAnimationPassword = useRef(new Animated.Value(0)).current;

  // Clear error after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        Animated.timing(errorOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setError(null));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, errorOpacity]);

  // Email validation function
  const isValidEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return email.trim() !== '' && password.trim() !== '' && isValidEmail(email.trim());
  }, [email, password, isValidEmail]);

  // Shake animation function
  const triggerShakeAnimation = useCallback((animatedValue: Animated.Value) => {
    animatedValue.setValue(0);
    Animated.sequence([
      Animated.timing(animatedValue, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  // Border animation function
  const triggerBorderAnimation = useCallback((animatedValue: Animated.Value) => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }, 2000);
    });
  }, []);

  // Show error with animation
  const showError = useCallback((message: string, field?: 'email' | 'password' | 'general') => {
    setError({ message, field });
    
    // Animate error opacity
    errorOpacity.setValue(0);
    Animated.timing(errorOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Trigger appropriate animations
    if (field === 'email') {
      triggerShakeAnimation(shakeAnimationEmail);
      triggerBorderAnimation(borderAnimationEmail);
    } else if (field === 'password') {
      triggerShakeAnimation(shakeAnimationPassword);
      triggerBorderAnimation(borderAnimationPassword);
    } else {
      triggerShakeAnimation(shakeAnimationGeneral);
    }
  }, [triggerShakeAnimation, triggerBorderAnimation, shakeAnimationEmail, shakeAnimationPassword, shakeAnimationGeneral, borderAnimationEmail, borderAnimationPassword, errorOpacity]);

  // Handle login with animated error feedback
  const handleLogin = useCallback(async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Enhanced validation with animated feedback
    if (!trimmedEmail || !trimmedPassword) {
      showError('Por favor completá todos los campos', 'general');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      showError('Por favor ingresá un email válido', 'email');
      return;
    }

    if (trimmedPassword.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres', 'password');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/login', { 
        email: trimmedEmail, 
        password: trimmedPassword 
      });
      
      const data = response.data;
      
      // Validate token exists
      if (!data.token) {
        showError('No se recibió un token válido del servidor', 'general');
        return;
      }

      await signIn(data.token);

    } catch (error: any) {
      if (error.response) {
        console.log('Login error:', error.response.data);
      } else {
        console.log('Login error:', error.message);
      }
      
      if (error.response?.status === 401) {
        showError('Credenciales incorrectas', 'general');
      } else if (error.response?.status === 403) {
        setShowVerificationPrompt(true);
        showError('Tu cuenta aún no fue verificada', 'general');
      } else if (error.response?.status === 429) {
        showError('Demasiados intentos. Intentá de nuevo más tarde.', 'general');
      } else if (error.response?.status >= 500) {
        let message = 'Error del servidor. Intentá de nuevo más tarde.';
        if (__DEV__ && error.response?.data?.message) {
          message = error.response.data.message;
        }
        showError(message, 'general');
      } else if (error.response?.data?.message) {
        showError(error.response.data.message, 'general');
      } else if (error.message?.includes('Network')) {
        showError('Error de conexión. Verificá tu conexión a internet.', 'general');
      } else {
        showError('No se pudo conectar al servidor.', 'general');
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, isValidEmail, signIn, showError]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Navigate to forgot password
  const navigateToForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  // Navigate to register
  const navigateToRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  // Handle verification prompt
  const handleVerificationAccept = useCallback(() => {
    setShowVerificationPrompt(false);
    setShowOTP(true);
  }, []);

  const handleVerificationCancel = useCallback(() => {
    setShowVerificationPrompt(false);
  }, []);

  if (showOTP) {
    return (
      <OTPVerification
        email={email.trim().toLowerCase()}
      />
    );
  }

  const emailBorderColor = borderAnimationEmail.interpolate({
    inputRange: [0, 1],
    outputRange: ['#333', '#ff4444']
  });

  const passwordBorderColor = borderAnimationPassword.interpolate({
    inputRange: [0, 1],
    outputRange: ['#333', '#ff4444']
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateX: shakeAnimationGeneral }] }}>
        <Text style={styles.title}>Inicio de sesión</Text>
        <Text style={styles.subtitle}>Iniciá sesión para continuar</Text>
      </Animated.View>
      
      {/* Error Message */}
      {error && (
        <Animated.View style={[styles.errorContainer, { opacity: errorOpacity }]}>
          <View style={styles.errorContent}>
            <Ionicons name="alert-circle" size={20} color="#ff4444" />
            <Text style={styles.errorText}>{error.message}</Text>
          </View>
        </Animated.View>
      )}

      {/* Verification Prompt */}
      {showVerificationPrompt && (
        <Animated.View style={[styles.verificationPrompt, { opacity: errorOpacity }]}>
          <View style={styles.verificationContent}>
            <Ionicons name="mail" size={24} color="#4CAF50" />
            <Text style={styles.verificationTitle}>Verificación requerida</Text>
            <Text style={styles.verificationText}>
              Te enviaremos un código para verificar tu cuenta
            </Text>
            <View style={styles.verificationButtons}>
              <Pressable 
                style={[styles.verificationButton, styles.cancelButton]} 
                onPress={handleVerificationCancel}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable 
                style={[styles.verificationButton, styles.acceptButton]} 
                onPress={handleVerificationAccept}
              >
                <Text style={styles.acceptButtonText}>Verificar</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      )}
      
      <Animated.View 
        style={[
          styles.inputGroup,
          { transform: [{ translateX: shakeAnimationEmail }] }
        ]}
      >
        <Text style={styles.label}>Email</Text>
        <Animated.View style={[styles.inputContainer, { borderColor: emailBorderColor }]}>
          <TextInput
            style={[styles.input, styles.inputNoBorder]}
            placeholder="correo@mail.com"
            placeholderTextColor="#666"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
        </Animated.View>
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.inputGroup,
          { transform: [{ translateX: shakeAnimationPassword }] }
        ]}
      >
        <Text style={styles.label}>Contraseña</Text>
        <Animated.View style={[styles.passwordContainer, { borderColor: passwordBorderColor }]}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="••••••••"
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
            autoComplete="password"
            textContentType="password"
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <Pressable
            style={styles.eyeButton}
            onPress={togglePasswordVisibility}
            disabled={loading}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#666"
            />
          </Pressable>
        </Animated.View>
      </Animated.View>
      
      <Pressable 
        onPress={navigateToForgotPassword}
        disabled={loading}
      >
        <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
      </Pressable>

      <Pressable 
        style={[
          styles.loginButton, 
          (!isFormValid || loading) && styles.loginButtonDisabled
        ]} 
        onPress={handleLogin} 
        disabled={!isFormValid || loading}
      >
        <Text style={[
          styles.loginButtonText,
          (!isFormValid || loading) && styles.loginButtonTextDisabled
        ]}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Text>
      </Pressable>

      <Pressable 
        onPress={navigateToRegister}
        disabled={loading}
      >
        <Text style={styles.registerText}>
          ¿No tenés una cuenta? <Text style={styles.registerLink}>Registrate</Text>
        </Text>
      </Pressable>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
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
    marginBottom: 12,
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
  inputNoBorder: {
    borderWidth: 0,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  forgotPassword: {
    fontSize: 16,
    color: '#9BA1A6',
    textDecorationLine: 'underline',
    fontWeight: '500',
    marginBottom: 12,
    alignSelf: 'flex-end',
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
  registerText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  registerLink: {
    color: 'white',
    textDecorationLine: 'underline',
  },
  passwordContainer: {
    position: 'relative',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: 'transparent',
  },
  passwordInput: {
    paddingRight: 48,
    borderWidth: 0,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  loginButtonDisabled: {
    backgroundColor: '#333',
    opacity: 0.6,
  },
  loginButtonTextDisabled: {
    color: '#666',
  },
  inputContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: 'transparent',
  },
  // Error styles
  errorContainer: {
    marginVertical: 16,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  // Verification prompt styles
  verificationPrompt: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
  },
  verificationContent: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  verificationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  verificationText: {
    color: '#9BA1A6',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  verificationButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  verificationButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
  },
  cancelButtonText: {
    color: '#9BA1A6',
    fontWeight: '500',
    fontSize: 16,
  },
  acceptButton: {
    backgroundColor: 'white',
  },
  acceptButtonText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 16,
  },
});