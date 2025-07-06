import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, TextStyle, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import QRScanner from '../scanner/QRScanner';
import PackageInfoModal from './PackageInfoModal';

type Route = {
  id: number;
  packageInfo: string;
  origin: string;
  destination: string;
  status: string;
  userInfo: string;
  deliveryUserInfo: string;
  createdAt: string;
};

export default function ShipmentsScreen() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [showPackageInfo, setShowPackageInfo] = useState(false);
  const [packageInfo, setPackageInfo] = useState<any>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await api.get('/routes/visible');
        setRoutes(response.data);
      } catch (error) {
        console.error('Error cargando rutas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleQRScan = async (data: string) => {
    try {
      setShowScanner(false);
      const response = await api.get(`/packages/${data}`);
      const packageData = response.data;
      
      setPackageInfo({
        id: packageData.id,
        packageCode: data,
        description: packageData.description || 'Paquete estándar',
        weight: packageData.weight || '2.5 kg',
        dimensions: packageData.dimensions || '30x20x15 cm',
        location: packageData.location || 'Zona A',
        shelf: packageData.shelf || 'A-12',
        recipient: {
          name: packageData.recipientName || 'Juan Pérez',
          address: packageData.recipientAddress || 'Av. Corrientes 1234, CABA',
          phone: packageData.recipientPhone || '+54 11 1234-5678'
        },
        route: packageData.route
      });
      
      setShowPackageInfo(true);
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo obtener la información del paquete. Por favor, verifica el código QR.'
      );
    }
  };

  const handleStartDelivery = async () => {
    try {
      if (packageInfo?.route) {
        await api.patch(`/routes/${packageInfo.route.id}/unlock`);
        Alert.alert(
          'Ruta Desbloqueada',
          'La ruta ha sido desbloqueada. Puedes comenzar con la entrega.',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowPackageInfo(false);
                fetchRoutes();
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo desbloquear la ruta.');
    }
  };

  const getStatusStyle = (status: string): TextStyle => ({
    color:
      status === 'DELIVERED'
        ? '#4caf50'
        : status === 'IN_PROGRESS'
        ? '#2196f3'
        : '#ffc107',
    marginTop: 4,
    fontWeight: 'bold',
  });

  const renderItem = ({ item }: { item: Route }) => (
    <View style={styles.card}>
      <Text style={styles.routeId}>
        {item.deliveryUserInfo?.toUpperCase() || 'SIN TRANSPORTISTA'}-{item.id}
      </Text>
      <Text style={styles.label}>Envío: {item.packageInfo}</Text>
      <Text style={styles.label}>Fecha de creación: {item.createdAt}</Text>
      <Text style={styles.label}>Origen: {item.origin}</Text>
      <Text style={styles.label}>Destino: {item.destination}</Text>
      <Text style={styles.label}>Cliente: {item.userInfo}</Text>
      <Text style={styles.label}>Transportista: {item.deliveryUserInfo}</Text>
      <Text style={getStatusStyle(item.status)}>{item.status}</Text>

      <View style={styles.buttons}>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Cambiar estado</Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00bcd4" />
        <Text style={styles.label}>Cargando rutas...</Text>
      </View>
    );
  }

  if (routes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Todavía no tenés rutas asignadas.</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Mis Rutas</Text>
        <Pressable 
          style={styles.scanButton} 
          onPress={() => setShowScanner(true)}
        >
          <Ionicons name="qr-code" size={24} color="black" />
          <Text style={styles.scanButtonText}>Escanear QR</Text>
        </Pressable>
      </View>
      
      <FlatList
        contentContainerStyle={styles.container}
        data={routes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
      
      <QRScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleQRScan}
      />
      
      <PackageInfoModal
        visible={showPackageInfo}
        packageInfo={packageInfo}
        onClose={() => setShowPackageInfo(false)}
        onStartDelivery={handleStartDelivery}
      />
    </View>
  );

}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#111',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#1c1c1c',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  scanButtonText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 16,
  },
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1c1c1c',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  routeId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  label: {
    color: '#ccc',
    marginBottom: 2,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  button: {
    backgroundColor: '#00bcd4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  emptyText: {
    color: '#ccc',
    fontSize: 16,
    fontStyle: 'italic',
  },
});


