import Loader from '@/components/Loader';
import { useSession } from '@/context/SessionContext';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppStack from './AppStack';
import AuthStack from './AuthStack';
import Toast from 'react-native-toast-message';

export default function AppNavigator() {
    const { session, isLoading } = useSession();

    if (isLoading) {
        return <Loader />
    }

    return (
      <>
        <StatusBar style="light" translucent={true} />
        <NavigationContainer>
          {session ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
        <Toast />
      </>
    );

}