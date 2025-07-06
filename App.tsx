import AppNavigator from '@/app/AppNavigator';
import { SessionProvider } from './context/SessionContext';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  return (
    <SessionProvider>
      <AppNavigator />
    </SessionProvider>
  );
}