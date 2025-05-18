import OTPVerification from '@/components/register/otp/OTPVerification';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function ResetPassword() {
  const router = useRouter();
  const [email] = useState('usuario@ejemplo.com');
  
  const handleVerify = async (code: string) => {
    // Aquí iría la lógica para verificar el código con el backend
    console.log('Código verificado:', code);
    
    // Después de verificar, redireccionar a la pantalla de nueva contraseña
    // router.push('/nueva-contrasena');
  };
  
  const handleResendCode = async () => {
    // Aquí iría la lógica para reenviar el código
    console.log('Reenviar código al email:', email);
    
    // Normalmente aquí se llamaría a la API
    return Promise.resolve();
  };
  
  return (
    <View style={styles.container}>
      <OTPVerification 
        email={email}
        onVerify={handleVerify}
        onResendCode={handleResendCode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
}); 