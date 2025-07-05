import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';

export async function registerForPushNotificationsAsync(userId: string) {
try {
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

const tokenData = await Notifications.getExpoPushTokenAsync();
const token = tokenData.data;

console.log("✅ User ID:", userId);
console.log("✅ Token FCM:", token);

await axios.post('http://10.0.2.2:8080/api/notifications/token', {
      userId,
token,
});

console.log("✅ Token enviado exitosamente al backend");
} catch (error: any) {
console.error("❌ Error en registerForPushNotificationsAsync:", error.message);
}
}


