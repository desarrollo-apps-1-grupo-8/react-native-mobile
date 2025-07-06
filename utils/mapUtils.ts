import { Linking, Platform } from 'react-native';

export const openLocationInMaps = (location: string) => {
  if (!location) return;
  
  const url = Platform.select({
    ios: `maps:0,0?q=${encodeURIComponent(location)}`,
    android: `geo:0,0?q=${encodeURIComponent(location)}`
  });

  if (url) {
    Linking.canOpenURL(url)
      .then((supported) => {
        const mapUrl = supported
          ? url
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
        return Linking.openURL(mapUrl);
      })
      .catch((err) => console.error("Error al abrir Google Maps:", err));
  }
}; 