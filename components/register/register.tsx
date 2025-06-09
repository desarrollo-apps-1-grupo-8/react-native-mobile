//	Pantalla principal de login (UI y lógica)
import { useSession } from "@/context/SessionContext";
import api from "@/services/api";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import OTPVerification from "../otp/OTPVerification";

type ErrorType = {
  firstName?: string;
  lastName?: string;
  dni?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
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
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [userType, setUserType] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<ErrorType>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Animation references for focus
  const firstNameBorderAnim = useRef(new Animated.Value(0)).current;
  const lastNameBorderAnim = useRef(new Animated.Value(0)).current;
  const dniBorderAnim = useRef(new Animated.Value(0)).current;
  const phoneBorderAnim = useRef(new Animated.Value(0)).current;
  const emailBorderAnim = useRef(new Animated.Value(0)).current;
  const passwordBorderAnim = useRef(new Animated.Value(0)).current;
  const confirmPasswordBorderAnim = useRef(new Animated.Value(0)).current;

  const isValidEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const animateBorder = useCallback((animValue: Animated.Value, toValue: number) => {
    Animated.timing(animValue, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, []);

  const handleFocus = useCallback((field: string, animValue: Animated.Value) => {
    setFocusedField(field);
    animateBorder(animValue, 1);
    // Clear error for this field when focused
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, [animateBorder]);

  const handleBlur = useCallback((field: string, animValue: Animated.Value) => {
    setFocusedField(null);
    animateBorder(animValue, 0);
  }, [animateBorder]);

  const getBorderColor = useCallback((field: string, animValue: Animated.Value) => {
    const hasError = errors[field as keyof ErrorType];
    
    if (hasError) {
      return '#ff4444';
    }
    
    return animValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#333', '#FFFFFF']
    });
  }, [errors]);

  const formatDNI = (value: string) => {
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
    const numbers = value.replace(/\D/g, '');
    setPhone(numbers);
  };

  const validateStep1 = useCallback(() => {
    const newErrors: ErrorType = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    
    if (!dni.trim()) {
      newErrors.dni = 'El DNI es requerido';
    } else if (dni.replace(/\./g, '').length < 7) {
      newErrors.dni = 'El DNI debe tener al menos 7 dígitos';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (phone.length < 10) {
      newErrors.phone = 'El teléfono debe tener 10 dígitos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [firstName, lastName, dni, phone]);

  const validateStep2 = useCallback(() => {
    const newErrors: ErrorType = {};
    
    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Por favor ingresá un email válido';
    }
    
    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmá tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, confirmPassword, isValidEmail]);

  const handleRegister = async () => {
    if (!validateStep2()) {
      return;
    }

    try {
      setLoading(true);

      await api.post("/register", { 
        email, 
        password, 
        firstName, 
        lastName, 
        dni: dni.replace(/\./g, ''), 
        phone, 
        roleId: userType 
      });
      setShowOTP(true);
    } catch (error: any) {
      if (error.response) {
        console.log('Register error:', error.response.data);
        Alert.alert("Error", error.response.data.message || "Ocurrió un error");
      } else {
        console.log('Register error:', error.message);
        Alert.alert("Error", "No se pudo conectar al servidor.");
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

  const handleNextStep = () => {
    if (!validateStep1()) {
      return;
    }
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setErrors({});
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
                <Animated.View style={[styles.inputContainer, { borderColor: getBorderColor('firstName', firstNameBorderAnim) }]}>
                  <TextInput
                    style={[styles.input, styles.inputNoBorder]}
                    placeholder="John"
                    placeholderTextColor="#666"
                    autoCapitalize="words"
                    value={firstName}
                    onChangeText={setFirstname}
                    onFocus={() => handleFocus('firstName', firstNameBorderAnim)}
                    onBlur={() => handleBlur('firstName', firstNameBorderAnim)}
                  />
                </Animated.View>
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Apellido</Text>
                <Animated.View style={[styles.inputContainer, { borderColor: getBorderColor('lastName', lastNameBorderAnim) }]}>
                  <TextInput
                    style={[styles.input, styles.inputNoBorder]}
                    placeholder="Doe"
                    placeholderTextColor="#666"
                    autoCapitalize="words"
                    value={lastName}
                    onChangeText={setLastname}
                    onFocus={() => handleFocus('lastName', lastNameBorderAnim)}
                    onBlur={() => handleBlur('lastName', lastNameBorderAnim)}
                  />
                </Animated.View>
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>DNI</Text>
              <Animated.View style={[styles.inputContainer, { borderColor: getBorderColor('dni', dniBorderAnim) }]}>
                <TextInput
                  style={[styles.input, styles.inputNoBorder]}
                  placeholder="42.996.646"
                  placeholderTextColor="#666"
                  value={dni}
                  onChangeText={handleDNIChange}
                  keyboardType="numeric"
                  maxLength={10}
                  onFocus={() => handleFocus('dni', dniBorderAnim)}
                  onBlur={() => handleBlur('dni', dniBorderAnim)}
                />
              </Animated.View>
              {errors.dni && <Text style={styles.errorText}>{errors.dni}</Text>}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Celular</Text>
              <Animated.View style={[styles.inputContainer, { borderColor: getBorderColor('phone', phoneBorderAnim) }]}>
                <TextInput
                  style={[styles.input, styles.inputNoBorder]}
                  placeholder="1160335900"
                  placeholderTextColor="#666"
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="numeric"
                  maxLength={10}
                  onFocus={() => handleFocus('phone', phoneBorderAnim)}
                  onBlur={() => handleBlur('phone', phoneBorderAnim)}
                />
              </Animated.View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>
            <View style={styles.userTypeContainer}>
              <Text style={styles.label}>Tipo de cuenta</Text>
              <View style={styles.userTypeButtons}>
                <Pressable
                  style={[
                    styles.userTypeButton,
                    userType === 1 && styles.userTypeButtonActive
                  ]}
                  onPress={() => setUserType(1)}
                >
                  <Text style={[
                    styles.userTypeButtonText,
                    userType === 1 && styles.userTypeButtonTextActive
                  ]}>Repartidor</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.userTypeButton,
                    userType === 2 && styles.userTypeButtonActive
                  ]}
                  onPress={() => setUserType(2)}
                >
                  <Text style={[
                    styles.userTypeButtonText,
                    userType === 2 && styles.userTypeButtonTextActive
                  ]}>Usuario</Text>
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
              <Animated.View style={[styles.inputContainer, { borderColor: getBorderColor('email', emailBorderAnim) }]}>
                <TextInput
                  style={[styles.input, styles.inputNoBorder]}
                  placeholder="correo@mail.com"
                  placeholderTextColor="#666"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => handleFocus('email', emailBorderAnim)}
                  onBlur={() => handleBlur('email', emailBorderAnim)}
                />
              </Animated.View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <Animated.View style={[styles.passwordContainer, { borderColor: getBorderColor('password', passwordBorderAnim) }]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  autoCapitalize="none"
                  placeholderTextColor="#666"
                  keyboardType="default"
                  secureTextEntry={showPassword}
                  showSoftInputOnFocus={false}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => handleFocus('password', passwordBorderAnim)}
                  onBlur={() => handleBlur('password', passwordBorderAnim)}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => {
                    setShowPassword(!showPassword);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color={showPassword ? "#666" : "#fff"}
                  />
                </Pressable>
              </Animated.View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <Animated.View style={[styles.passwordContainer, { borderColor: getBorderColor('confirmPassword', confirmPasswordBorderAnim) }]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  autoCapitalize="none"
                  placeholderTextColor="#666"
                  keyboardType="default"
                  secureTextEntry={showConfirmPassword}
                  showSoftInputOnFocus={false}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => handleFocus('confirmPassword', confirmPasswordBorderAnim)}
                  onBlur={() => handleBlur('confirmPassword', confirmPasswordBorderAnim)}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => {
                    setShowConfirmPassword(!showConfirmPassword);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={20}
                    color={showConfirmPassword ? "#666" : "#fff"}
                  />
                </Pressable>
              </Animated.View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
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
                onPress={handleRegister}
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
    fontSize: 16,
  },
  inputNoBorder: {
    borderWidth: 0,
  },
  inputContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: 'transparent',
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
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    height: 56,
  },
  passwordInput: {
    flex: 1,
    backgroundColor: "transparent",
    color: "white",
    fontSize: 16,
    paddingVertical: 0,
    paddingRight: 8,
  },
  eyeButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
    minHeight: 32,
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
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
});
