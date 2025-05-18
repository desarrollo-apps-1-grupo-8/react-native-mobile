import Loader from '@/components/Loader';
import { useSession } from '@/context/SessionContext';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppStack from './AppStack';
import AuthStack from './AuthStack';

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
        </>
    );
}