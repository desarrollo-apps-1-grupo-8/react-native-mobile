import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, TextStyle } from 'react-native';
import api from '@/services/api';

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


