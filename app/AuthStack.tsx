import LoginScreen from '@/components/login/login';
import RegisterScreen from '@/components/register/register';
import ForgotPasswordScreen from '@/components/resetPassword/forgot-password';
import ResetPasswordScreen from '@/components/resetPassword/reset-password';
import { createStackNavigator } from '@react-navigation/stack';


const Stack = createStackNavigator();

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