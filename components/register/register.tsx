//	Pantalla principal de login (UI y lógica)
import { useSession } from "@/context/SessionContext";
import api from "@/services/api";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import OTPVerification from "../otp/OTPVerification";

export default function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastname] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<'usuario' | 'repartidor'>('usuario');

  const formatDNI = (value: string) => {
    // Eliminar todos los caracteres no numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplicar el formato xx.xxx.xxx
    let formatted = '';
    if (numbers.length > 0) {
      formatted = numbers.slice(0, 2);
      if (numbers.length > 2) {
        formatted += '.' + numbers.slice(2, 5);
        if (numbers.length > 5) {
          formatted += '.' + numbers.slice(5, 8);
        }
      }
    }
    
    return formatted;
  };

  const handleDNIChange = (value: string) => {
    const formatted = formatDNI(value);
    setDni(formatted);
  };

  const handlePhoneChange = (value: string) => {
    // Eliminar todos los caracteres no numéricos
    const numbers = value.replace(/\D/g, '');
    setPhone(numbers);
  };

  const handleVerifyOTP = async (code: string) => {
    try {
      const response = await api.post("/verify-otp", { email, code });
      const data = response.data;

      if (data.success) {
        const token = data.token;
        await AsyncStorage.setItem("token", token);
        signIn(token);
      } else {
        Alert.alert("Error", "Código inválido");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo verificar el código");
    }
  };

  const handleResendOTP = async () => {
    try {
      await api.post("/resend-otp", { email });
    } catch (error) {
      Alert.alert("Error", "No se pudo reenviar el código");
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completá todos los campos");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/register", { email, password });
      const data = response.data;
      if (!data.success) {
        if (data.status === "NEEDS_VERIFICATION") {
          Alert.alert(
            "Verificación requerida",
            "Tu cuenta aún no fue verificada.",
            [
              {
                text: "OK",
                onPress: () => {
                  setShowOTP(true);
                },
              },
            ]
          );
        } else {
          Alert.alert("Error", "Credenciales incorrectas.");
        }
        return;
      }

      const token = data.token;
      await AsyncStorage.setItem("token", token);
      signIn(token);
    } catch (error: any) {
      console.error(error);
      if (error.response?.data?.message) {
        Alert.alert("Error", error.response.data.message);
      } else {
        Alert.alert("Error", "No se pudo conectar al servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (!firstName || !lastName || !dni || !phone) {
      Alert.alert("Error", "Por favor completá todos los campos");
      return;
    }
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Registro</Text>
        <Text style={styles.subtitle}>Registrate para obtener tu cuenta</Text>
        
        {currentStep === 1 ? (
          <>
            <View style={styles.nameContainer}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John"
                  placeholderTextColor="#666"
                  autoCapitalize="none"
                  value={firstName}
                  onChangeText={setFirstname}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Apellido</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Doe"
                  placeholderTextColor="#666"
                  autoCapitalize="none"
                  value={lastName}
                  onChangeText={setLastname}
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>DNI</Text>
              <TextInput
                style={styles.input}
                placeholder="42.996.646"
                placeholderTextColor="#666"
                autoCapitalize="none"
                value={dni}
                onChangeText={handleDNIChange}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Celular</Text>
              <TextInput
                style={styles.input}
                placeholder="1160335900"
                placeholderTextColor="#666"
                autoCapitalize="none"
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <View style={styles.userTypeContainer}>
              <Text style={styles.label}>Tipo de cuenta</Text>
              <View style={styles.userTypeButtons}>
                <Pressable
                  style={[
                    styles.userTypeButton,
                    userType === 'usuario' && styles.userTypeButtonActive
                  ]}
                  onPress={() => setUserType('usuario')}
                >
                  <Text style={[
                    styles.userTypeButtonText,
                    userType === 'usuario' && styles.userTypeButtonTextActive
                  ]}>Usuario</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.userTypeButton,
                    userType === 'repartidor' && styles.userTypeButtonActive
                  ]}
                  onPress={() => setUserType('repartidor')}
                >
                  <Text style={[
                    styles.userTypeButtonText,
                    userType === 'repartidor' && styles.userTypeButtonTextActive
                  ]}>Repartidor</Text>
                </Pressable>
              </View>
            </View>
            <Pressable
              style={styles.registerButton}
              onPress={handleNextStep}
            >
              <Text style={styles.registerButtonText}>Siguiente</Text>
            </Pressable>
          </>
        ) : (
          <>
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
            <View style={styles.inputGroup}>
              <View style={styles.passwordHeader}>
                <Text style={styles.label}>Confirmar Contraseña</Text>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="••••••••"
                  placeholderTextColor="#666"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#666"
                  />
                </Pressable>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <Pressable
                style={styles.secondaryButton}
                onPress={handlePrevStep}
              >
                <Text style={styles.secondaryButtonText}>Atrás</Text>
              </Pressable>
              <Pressable
                style={styles.registerButton}
                //onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.registerButtonText}>
                  {loading ? "Registrando..." : "Registrarse"}
                </Text>
              </Pressable>
            </View>
          </>
        )}

        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.registerText}>
            ¿Ya tenés una cuenta?{" "}
            <Text style={{ textDecorationLine: "underline" }}>Ingresá</Text>
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    color: "white",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#9BA1A6",
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    color: "white",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "transparent",
    color: "white",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    fontSize: 16,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  forgotPassword: {
    fontSize: 16,
    color: "#9BA1A6",
    textDecorationLine: "underline",
    fontWeight: "500",
    marginBottom: 12,
    alignSelf: "flex-end",
  },
  registerButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  registerButtonText: {
    color: "black",
    fontWeight: "600",
    fontSize: 18,
  },
  registerText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  registerLink: {
    color: "white",
    textDecorationLine: "underline",
  },
  nameContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 24,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'white',
    flex: 1,
  },
  secondaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
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
  userTypeContainer: {
    marginBottom: 24,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userTypeButtonActive: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  userTypeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  userTypeButtonTextActive: {
    color: 'black',
  },
});
