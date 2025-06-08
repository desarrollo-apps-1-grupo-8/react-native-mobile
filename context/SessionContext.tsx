import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface SessionContextProps {
  session: boolean | null;
  isLoading: boolean;
  role: string | null;
  userId: string | null;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  getUserId: () => Promise<string | null>;
  getUserRoleFromToken: () => Promise<string | null>;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const initializeSession = async () => {
    if (isInitialized) return;
    
    try {
      const token = await SecureStore.getItemAsync('session');
      if (token) {
        setSession(true);
        const userRole = await getUserRoleFromToken();
        const id = await getUserId();
        setRole(userRole);
        setUserId(id);
      } else {
        setSession(false);
        setRole(null);
        setUserId(null);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      setSession(false);
      setRole(null);
      setUserId(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    initializeSession();
  }, []); 

  const getUserId = async () => {
    try {
      const token = await SecureStore.getItemAsync('session');
      if (!token) return null;

      let tokenValue = token;
      if (tokenValue.startsWith('Bearer ')) {
        tokenValue = tokenValue.substring(7);
      }

      const parts = tokenValue.split('.');
      if (parts.length !== 3) {
        console.log('Token no tiene formato JWT válido');
        return null;
      }

      const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const json = JSON.parse(payload);

      return json.id;
    } catch (error) {
      console.error('Error al obtener ID del token:', error);
      return null;
    }
  };

  const signIn = async (token: string) => {
    try {
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      await SecureStore.setItemAsync('session', formattedToken);
      setSession(true);
      const userRole = await getUserRoleFromToken();
      const id = await getUserId();
      setRole(userRole);
      setUserId(id);
    } catch (error) {
      console.error('Error al guardar token:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync('session');
      setSession(false);
      setRole(null);
      setUserId(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  const getUserRoleFromToken = async (): Promise<string | null> => {
    try {
      const token = await SecureStore.getItemAsync('session');
      if (!token) return null;

      let tokenValue = token;
      if (tokenValue.startsWith('Bearer ')) {
        tokenValue = tokenValue.substring(7);
      }

      const parts = tokenValue.split('.');
      if (parts.length !== 3) return null;

      const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const json = JSON.parse(payload);
      
      return json.role || null;
    } catch (e) {
      console.error('Error getting role from token:', e);
      return null;
    }
  };  

  return (
    <SessionContext.Provider value={{ session, isLoading, role, userId, signIn, signOut, getUserId, getUserRoleFromToken }}>
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

