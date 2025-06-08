//	Pantalla principal de login (UI y lógica)
import { useSession } from '@/context/SessionContext';
import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState, useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import OTPVerification from '../otp/OTPVerification';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';

export default function LoginScreen() {
  const navigation = useNavigation<any>()
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const successAnim = useRef<LottieView>(null);
  const formRef = useRef(null);



  // Función de login con control de errores
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completá todos los campos');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/login', { email, password });
      const data = response.data;
      if (!data.success) {
        if (data.status === 'NEEDS_VERIFICATION') {
          Alert.alert('Verificación requerida', 'Tu cuenta aún no fue verificada.', [
            {
              text: 'OK',
              onPress: () => {
                setShowOTP(true);
              }
            }
          ]);
        } else {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('Error', 'Credenciales incorrectas.');
        }
        return;
      }

      const token = data.token;

            await AsyncStorage.setItem('token', token);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({
              type: 'success',
              text1: 'Inicio de sesión exitoso',
              position: 'bottom',
            });
            successAnim.current?.play();
            setTimeout(() => {
              signIn(token);
            }, 2000);



    } catch (error: any) {
      console.error(error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (error.response?.data?.message) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'No se pudo conectar al servidor.');
      }
    } finally {
      setLoading(false);
    }
  };


  if (showOTP) {
    return (
      <OTPVerification
        email={email}
      />
    );
  }

  return (
    <Animatable.View
        ref={formRef}
        style={styles.container}
        duration={500}
        easing="ease-in-out"
      >
      <View style={styles.formContainer}></View>
      <Text style={styles.title}>Inicio de sesión</Text>
      <Text style={styles.subtitle}>Iniciá sesión para continuar</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="correo@mail.com"
          placeholderTextColor="#666"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        </View>
        <View style={styles.inputGroup}>
          <View style={styles.passwordHeader}>
            <Text style={styles.label}>Contraseña</Text>
          </View>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="••••••••"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#666"
              />
            </Pressable>
          </View>
        </View>
        <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
          </Pressable>

        <Pressable style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.loginButtonText}>{loading ? 'Ingresando...' : 'Ingresar'}</Text>
        </Pressable>


          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>
              ¿No tenés una cuenta? <Text style={{ textDecorationLine: 'underline' }}>Registrate</Text>
            </Text>
          </Pressable>

          <LottieView
            ref={successAnim}
            source={require('../../assets/animations/success.json')}
            autoPlay={false}
            loop={false}
            style={{ width: 350, height: 350, alignSelf: 'center', position: 'absolute', top: '40%' }}
          />

          <Toast />
    </Animatable.View>
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
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
  },
});