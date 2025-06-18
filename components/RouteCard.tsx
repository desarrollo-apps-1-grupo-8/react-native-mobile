import React, { useState } from "react";
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DeliveryRouteResponseWithUserInfo } from "../types/route";
import { RouteStatusEnum } from "../utils/routeStatusEnum";

interface RouteCardProps {
  route: DeliveryRouteResponseWithUserInfo;
  role: string;
  onPress?: (routeId: number, status: string) => void;
  generateQr?: (routeId: number) => Promise<string>;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  IN_TRANSIT: { bg: "#2563eb", text: "#fff" }, // Azul
  DELAYED: { bg: "#ef4444", text: "#fff" },   // Rojo
  COMPLETED: { bg: "#22c55e", text: "#fff" }, // Verde
  AVAILABLE: { bg: "#f59e42", text: "#fff" }, // Naranja
  DEFAULT: { bg: "#6b7280", text: "#fff" },   // Gris
};

const getStatusStyle = (status: string) => statusColors[status] || statusColors.DEFAULT;

export const RouteCard: React.FC<RouteCardProps> = ({ route, role, onPress, generateQr}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const isRepartidor = role === "REPARTIDOR";
  const status = route.status;
  const statusSpanish = RouteStatusEnum[status as keyof typeof RouteStatusEnum]?.spanish || status;
  const statusStyle = getStatusStyle(status);

  const handleGenerateQr = async () => {
    if (!generateQr) return;
    setIsLoading(true);
    try {
      const qrBase64 = await generateQr(route.id);
      if (!qrBase64) {
        throw new Error('No se recibió el QR del servidor');
      }
      const formattedBase64 = `data:image/png;base64,${qrBase64}`;
      setQrImage(formattedBase64);
    } catch (error) {
      console.error('Error al generar QR:', error);
      setQrImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  console.log('RouteCard Debug:', {
    isRepartidor,
    hasDeliveryUser: !!route.deliveryUserInfo,
    status,
    shouldShowQrButton: isRepartidor && !route.deliveryUserInfo && status === "AVAILABLE"
  });

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
      <Text style={styles.label}>Cliente:</Text>
      <Text style={styles.value}>{route.userInfo}</Text>
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
      {(isRepartidor && !route.deliveryUserInfo && status === "AVAILABLE") && 
      <>
        <TouchableOpacity 
          style={styles.buttonPrincipal} 
          onPress={handleGenerateQr}
        >
          <Text style={styles.buttonText}>Generar QR</Text>
        </TouchableOpacity>
      </>}
        {isRepartidor && status === "IN_PROGRESS" && (
          <TouchableOpacity style={styles.buttonPrincipal} onPress={() => onPress?.(route.id, "COMPLETED")}> 
            <Text style={styles.buttonText}>Finalizar ruta</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={isLoading || !!qrImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setIsLoading(false);
          setQrImage(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {isLoading ? (
              <>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.modalText}>Generando QR...</Text>
              </>
            ) : qrImage ? (
              <>
                <Text style={styles.modalText}>Escanea el siguiente QR para asignarte la ruta:</Text>
                <Image 
                  source={{ uri: qrImage }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setQrImage(null)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 