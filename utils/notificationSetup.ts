import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';

export async function registerForPushNotificationsAsync(userId: string) {
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

console.log("Token FCM:", token);

// Enviar token al backend
  await axios.post('http:localhost/api/notifications/token', {
    userId,
token,
});
}
