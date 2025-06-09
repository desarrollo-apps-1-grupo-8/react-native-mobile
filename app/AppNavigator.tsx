import Loader from '@/components/Loader';
import NetworkStatus from '@/components/ui/NetworkStatus';
import { useSession } from '@/context/SessionContext';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import AppStack from './AppStack';
import AuthStack from './AuthStack';


export default function AppNavigator() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <Loader />;
  }


    return (
      <>
        <StatusBar style="light" translucent={true} />
        <NetworkStatus />
        <NavigationContainer>
          {session ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
        <Toast />
      </>
    );

}

