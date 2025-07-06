import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

type NetworkStatusProps = {
  onRetry?: () => void;
};

export default function NetworkStatus({ onRetry }: NetworkStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [showStatus, setShowStatus] = useState(false);

  // Animation references
  const slideAnimation = useRef(new Animated.Value(-100)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Check connection status
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupNetworkListener = async () => {
      // Get initial state
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected);
      
      // Listen for changes
      unsubscribe = NetInfo.addEventListener(state => {
        const wasConnected = isConnected;
        const nowConnected = state.isConnected;
        
        setIsConnected(nowConnected);
        
        // Show status when connection changes
        if (wasConnected !== null && wasConnected !== nowConnected) {
          setShowStatus(true);
          showStatusAnimation();
          
          // Auto-hide after 3 seconds if connected
          if (nowConnected) {
            setTimeout(() => {
              hideStatusAnimation();
            }, 3000);
          }
        } else if (nowConnected === false) {
          // Always show when disconnected
          setShowStatus(true);
          showStatusAnimation();
        } else if (nowConnected === true && wasConnected === null) {
          // Initially connected, don't show status
          setShowStatus(false);
        }
      });
    };

    setupNetworkListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isConnected]);

  // Pulse animation for disconnected state
  useEffect(() => {
    if (isConnected === false && showStatus) {
      const startPulseAnimation = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnimation, {
              toValue: 0.7,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnimation, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };
      startPulseAnimation();
    } else {
      pulseAnimation.stopAnimation();
      pulseAnimation.setValue(1);
    }
  }, [isConnected, showStatus, pulseAnimation]);

  // Show status animation
  const showStatusAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnimation, opacityAnimation]);

  // Hide status animation
  const hideStatusAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowStatus(false);
    });
  }, [slideAnimation, opacityAnimation]);

  // Handle retry
  const handleRetry = useCallback(async () => {
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected);
    
    if (onRetry) {
      onRetry();
    }
  }, [onRetry]);

  // Don't render if not showing status
  if (!showStatus || isConnected === null) {
    return null;
  }

  const isDisconnected = isConnected === false;

  return (
    <Animated.View
      style={[
        styles.container,
        isDisconnected ? styles.disconnectedContainer : styles.connectedContainer,
        {
          transform: [{ translateY: slideAnimation }],
          opacity: opacityAnimation,
        },
      ]}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: pulseAnimation }] }
          ]}
        >
          <Ionicons
            name={isDisconnected ? "wifi-outline" : "checkmark-circle"}
            size={24}
            color={isDisconnected ? "#ff4444" : "#4CAF50"}
          />
        </Animated.View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, isDisconnected ? styles.errorTitle : styles.successTitle]}>
            {isDisconnected ? "Sin conexión a internet" : "Conectado"}
          </Text>
          <Text style={[styles.subtitle, isDisconnected ? styles.errorSubtitle : styles.successSubtitle]}>
            {isDisconnected 
              ? "Verificá tu conexión y volvé a intentar" 
              : "Conexión a internet restaurada"
            }
          </Text>
        </View>

        {isDisconnected && (
          <Pressable 
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Ionicons name="refresh" size={20} color="#666" />
          </Pressable>
        )}

        {!isDisconnected && (
          <Pressable 
            style={styles.closeButton}
            onPress={hideStatusAnimation}
          >
            <Ionicons name="close" size={20} color="#4CAF50" />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 99999,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 999,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disconnectedContainer: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderColor: '#ff4444',
  },
  connectedContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  errorTitle: {
    color: '#ff4444',
  },
  successTitle: {
    color: '#4CAF50',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  errorSubtitle: {
    color: '#9BA1A6',
  },
  successSubtitle: {
    color: '#9BA1A6',
  },
  retryButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#333',
  },
  closeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
}); 