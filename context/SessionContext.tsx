import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface SessionContextProps {
  session: string | null;
  isLoading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const token = await SecureStore.getItemAsync('session');
        setSession(token);
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  const signIn = (token: string) => {
    setSession(token);
    SecureStore.setItemAsync('session', token);
  };

  const signOut = async () => {
    setSession(null);
    await SecureStore.deleteItemAsync('session');
  };

  return (
    <SessionContext.Provider value={{ session, isLoading, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
} 