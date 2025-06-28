import api from "@/services/api";
import { RoleEnum } from "@/utils/roleEnum";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteCard } from "../components/RouteCard";
import { useSession } from "../context/SessionContext";
import { DeliveryRouteResponseWithUserInfo } from "../types/route";
import QRScanner from "../components/scanner/QRScanner";
import PackageInfoModal from "../components/shipments/PackageInfoModal";

export const MyRoutesScreen: React.FC = () => {
  const { session, user } = useSession();
  const [routes, setRoutes] = useState<DeliveryRouteResponseWithUserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showPackageInfo, setShowPackageInfo] = useState(false);
  const [packageInfo, setPackageInfo] = useState<any>(null);
  const insets = useSafeAreaInsets();

  const fetchRoutes = useCallback(async (isRefreshing = false) => {
    if (!session) return;
    
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      let response;
      response = await api.get(`/routes/deliveryUser/${user?.id}`);
      console.log(response)

      setRoutes(response.data);
    } catch (error: any) {
      console.error("Error al obtener las rutas:", error);
      setRoutes([]);
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [session, user]);

  const handleRefresh = useCallback(() => {
    fetchRoutes(true);
  }, [fetchRoutes]);

  useFocusEffect(
    useCallback(() => {
      fetchRoutes();
    }, [fetchRoutes])
  );

  const handleChangeRouteStatus = async (
    deliveryRouteId: number,
    status: string
  ) => {
    setLoading(true);
    try {
      await api.post(`/routes/update-status`, {
        deliveryRouteId,
        status,
        deliveryUserId: user?.id,
      });
      await fetchRoutes();

    } catch (error: any) {
      console.error("Error al cambiar estado de la ruta:", error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
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
          data={routes}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              tintColor="#fff"
              colors={["#fff"]}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="map-outline" 
                size={64} 
                color="#666666" 
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>
                Sin rutas asignadas
              </Text>
              <Text style={styles.emptySubtitle}>
                No tienes rutas asignadas en este momento.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <RouteCard
              route={item}
              role={RoleEnum.REPARTIDOR}
              onPress={(routeId: number, status: string) => handleChangeRouteStatus(routeId, status)}
            />
          )}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  listContent: {
    paddingBottom: 24,
    paddingHorizontal: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.7,
  },
  emptyTitle: {
    textAlign: "center",
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  emptySubtitle: {
    textAlign: "center",
    color: "#999999",
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 280,
  },
});
