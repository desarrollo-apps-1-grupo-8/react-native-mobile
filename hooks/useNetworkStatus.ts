import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupNetworkListener = async () => {
      try {
        // Get initial state
        const state = await NetInfo.fetch();
        setIsConnected(state.isConnected);
        setIsLoading(false);
        
        // Listen for changes
        unsubscribe = NetInfo.addEventListener(state => {
          setIsConnected(state.isConnected);
        });
      } catch (error) {
        console.error('Error setting up network listener:', error);
        setIsLoading(false);
      }
    };

    setupNetworkListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const checkConnection = async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected);
      return state.isConnected ?? false;
    } catch (error) {
      console.error('Error checking connection:', error);
      return false;
    }
  };

  return {
    isConnected,
    isLoading,
    checkConnection,
  };
}; 