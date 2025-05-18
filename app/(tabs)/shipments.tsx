import api from '@/services/api';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextStyle, View } from 'react-native';

type Route = {
  id: number;
  estimatedDeliveryDate: string;
  shippedDate: string;
  deliveryAddress: string;
  clientName: string;
  carrier: string;
  status: string;
};

export default function ShipmentsScreen() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusStyle = (status: string): TextStyle => ({
    color:
      status === 'Delivered'
        ? '#4caf50'
        : status === 'In Transit'
        ? '#2196f3'
        : '#ffc107',
    marginTop: 4,
    fontWeight: 'bold',
  });

  const renderItem = ({ item }: { item: Route }) => (
    <View style={styles.card}>
      <Text style={styles.routeId}>{item.carrier.toUpperCase()}-{item.id}</Text>
      <Text style={styles.label}>Entrega estimada: {item.estimatedDeliveryDate}</Text>
      <Text style={styles.label}>Fecha de envío: {item.shippedDate}</Text>
      <Text style={styles.label}>Dirección: {item.deliveryAddress}</Text>
      <Text style={styles.label}>Cliente: {item.clientName}</Text>
      <Text style={styles.label}>Transportista: {item.carrier}</Text>
      <Text style={getStatusStyle(item.status)}>{item.status}</Text>

      <View style={styles.buttons}>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Ver detalle</Text>
        </Pressable>
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

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={routes}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#111',
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
});

