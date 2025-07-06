import axios from 'axios';
import * as Notifications from 'expo-notifications';

export async function registerForPushNotificationsAsync(userId: string, jwt: string) {
  try {
    // 1. Pedir permisos de notificación
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

    // 2. Obtener el token de Expo (FCM)
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const pushToken = tokenData.data;

    console.log("User ID:", userId);
    console.log("Push Token:", pushToken);

    // 3. Enviar el token al backend
    await axios.post(
      'http://10.0.2.2:8080/api/notifications/token',
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

    console.log("Token enviado exitosamente al backend");
  } catch (error: any) {
    console.error(" Error en registerForPushNotificationsAsync:", error.response?.data || error.message);
  }
}
