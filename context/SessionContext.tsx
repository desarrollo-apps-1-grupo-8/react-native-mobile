import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface SessionContextProps {
  session: boolean | null;
  isLoading: boolean;
  user: User | null;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  getUserId: () => Promise<string | null>;
}

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
}

type TokenPayload = {
  id: string;
  sub: string; // email
  role: string;
  first_name?: string;
  firstName?: string;
  name?: string;
  exp?: number;
  iat?: number;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const decodeToken = (token: string): TokenPayload | null => {
    try {
      let tokenValue = token;
      if (tokenValue.startsWith('Bearer ')) {
        tokenValue = tokenValue.substring(7);
      }

      const parts = tokenValue.split('.');
      if (parts.length !== 3) return null;

      const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(payload) as TokenPayload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const createUserFromPayload = (payload: TokenPayload): User => {
    const name = payload.first_name || payload.firstName || payload.name || 'Usuario';
    
    return {
      id: payload.id,
      name: name,
      email: payload.sub,
      role: payload.role,
    };
  };
  
  const initializeSession = async () => {
    if (isInitialized) return;
    
    try {
      const token = await SecureStore.getItemAsync('session');
      if (token) {
        const payload = decodeToken(token);
        if (payload) {
          const userData = createUserFromPayload(payload);
          setUser(userData);
          setSession(true);
        } else {
          await SecureStore.deleteItemAsync('session');
          setSession(false);
          setUser(null);
        }
      } else {
        setSession(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      setSession(false);
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    initializeSession();
  }, []); 

  const getUserId = async (): Promise<string | null> => {
    try {
      const token = await SecureStore.getItemAsync('session');
      if (!token) return null;

      const payload = decodeToken(token);
      return payload?.id || null;
    } catch (error) {
      console.error('Error getting user ID from token:', error);
      return null;
    }
  };

  const signIn = async (token: string) => {
    try {
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      // Decode and validate token before storing
      const payload = decodeToken(formattedToken);
      if (!payload) {
        throw new Error('Invalid token format');
      }

      await SecureStore.setItemAsync('session', formattedToken);
      
      const userData = createUserFromPayload(payload);
      setUser(userData);
      setSession(true);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync('session');
      setSession(false);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <SessionContext.Provider value={{ session, isLoading, user, signIn, signOut, getUserId }}>
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

