import AppNavigator from '@/app/AppNavigator';
import { SessionProvider } from './context/SessionContext';

export default function App() {
  return (
    <SessionProvider>
      <AppNavigator />
    </SessionProvider>
  );
}