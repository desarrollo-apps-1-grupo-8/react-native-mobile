import api from '@/services/api';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync(userId: string, jwt: string) {
  try {
    // 1. Setup Android notification channel (required for Android)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // 2. Pedir permisos de notificación
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('No se otorgaron permisos para notificaciones');
      return;
    }

    // 3. Obtener el project ID de Constants
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    
    if (!projectId) {
      throw new Error('Project ID not found in configuration');
    }

    // 4. Obtener el token de Expo (FCM) con el project ID
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const pushToken = tokenData.data;
    // 5. Enviar el token al backend
    await api.post(
      '/notifications/token',
      {
        userId,
        token: pushToken,
      },
      {
        headers: {
          Authorization: jwt.startsWith("Bearer ") ? jwt : `Bearer ${jwt}`,
        },
      }
    );

  } catch (error: any) {
    console.error(" Error en registerForPushNotificationsAsync:", error.response?.data || error.message);
  }
}
