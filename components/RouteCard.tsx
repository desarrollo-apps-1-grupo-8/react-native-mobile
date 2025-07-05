import React from "react";
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RouteStatusEnum } from "../utils/routeStatusEnum";

const statusColors: Record<string, { bg: string; text: string }> = {
  IN_TRANSIT: { bg: "#2563eb", text: "#fff" }, // Azul
  DELAYED: { bg: "#ef4444", text: "#fff" },   // Rojo
  COMPLETED: { bg: "#22c55e", text: "#fff" }, // Verde
  AVAILABLE: { bg: "#f59e42", text: "#fff" }, // Naranja
  DEFAULT: { bg: "#6b7280", text: "#fff" },   // Gris
};

const getStatusStyle = (status: string) => statusColors[status] || statusColors.DEFAULT;

export const RouteCard: React.FC<any> = ({ route, role, onPress }) => {
  const isRepartidor = role === "REPARTIDOR";
  const status = route.status;
  const statusSpanish = RouteStatusEnum[status as keyof typeof RouteStatusEnum]?.spanish || status;
  const statusStyle = getStatusStyle(status);

  const handleAssignRoute = () => {
    // Primero cambiamos el estado de la ruta
    onPress(route.id, "IN_PROGRESS");

    // Luego intentamos abrir Google Maps
    const location = route.destination;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(location)}`,
      android: `geo:0,0?q=${encodeURIComponent(location)}`
    });

    Linking.canOpenURL(url)
      .then((supported) => {
        const mapUrl = supported
          ? url
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
        return Linking.openURL(mapUrl);
      })
      .catch((err) => console.error("Error al abrir Google Maps:", err));
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.tracking}>{route.id}</Text>
        <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}> 
          <Text style={{ color: statusStyle.text, fontWeight: "bold", fontSize: 12 }}>{statusSpanish}</Text>
        </View>
      </View>
      <Text style={styles.label}>Info del paquete:</Text>
      <Text style={styles.value}>{route.packageInfo}</Text>
      <Text style={styles.label}>Origen:</Text>
      <Text style={styles.value}>{route.origin}</Text>
      <Text style={styles.label}>Destino:</Text>
      <Text style={styles.value}>{route.destination}</Text>
      {
        route.userInfo && (
          <>
                <Text style={styles.label}>Cliente:</Text>
                <Text style={styles.value}>{route.userInfo}</Text>
          </>
        )
      }
      {route.deliveryUserInfo && 
      <>
        <Text style={styles.label}>Repartidor:</Text>
        <Text style={styles.value}>{route.deliveryUserInfo}</Text>
      </>}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Fecha de creación:</Text>
          <Text style={styles.value}>{route.createdAt?.split('T')[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Última actualización:</Text>
          <Text style={styles.value}>{route.updatedAt?.split('T')[0]}</Text>
        </View>
      </View>
      <View style={styles.buttonRow}>
        {/* <TouchableOpacity style={styles.buttonSecundario}>
          <Text style={styles.buttonText}>Ver detalles</Text>
        </TouchableOpacity> */}
        {isRepartidor && status === "IN_PROGRESS" && (
          <TouchableOpacity style={styles.buttonPrincipal} onPress={() => onPress(route.id, "COMPLETED")}> 
            <Text style={styles.buttonText}>Finalizar ruta</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 18,
    marginVertical: 10,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tracking: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    color: '#a1a1aa',
    fontSize: 13,
    marginTop: 6,
  },
  value: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 10,
  },
  buttonPrincipal: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  buttonSecundario: {
    backgroundColor: '#27272a',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
}); 