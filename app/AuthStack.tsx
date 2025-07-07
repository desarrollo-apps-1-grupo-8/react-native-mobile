import ForgotPasswordScreen from '@/screens/ForgotPasswordScreen';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import ResetPasswordScreen from '@/screens/ResetPasswordScreen';
import { createStackNavigator } from '@react-navigation/stack';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string; resetToken: string };
};

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/>
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen}/>
    </Stack.Navigator>
  );
}