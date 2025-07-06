import api from "@/services/api";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteCard } from "../components/RouteCard";
import QRScanner from "../components/scanner/QRScanner";
import CompletionCodeModal from "../components/shipments/CompletionCodeModal";
import PackageInfoModal from "../components/shipments/PackageInfoModal";
import { useSession } from "../context/SessionContext";
import { DeliveryRouteResponseWithUserInfo } from "../types/route";
import { RoleEnum } from "../utils/roleEnum";

export const RoutesScreen: React.FC = () => {
  const { session, user } = useSession();
  const [routes, setRoutes] = useState<DeliveryRouteResponseWithUserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showPackageInfo, setShowPackageInfo] = useState(false);
  const [packageInfo, setPackageInfo] = useState<any>(null);
  const [showCompletionCode, setShowCompletionCode] = useState(false);
  const [completionCode, setCompletionCode] = useState<string>('');

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

      if (user?.role === RoleEnum.REPARTIDOR) {
        response = await api.get(`/routes`);
      } else {
        response = await api.get(`/routes/user/${user?.id}`);
      }
      
      console.log("Rutas recibidas:", JSON.stringify(response.data, null, 2));
      console.log("Rol del usuario:", user?.role);
      
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
      if (user?.role === RoleEnum.REPARTIDOR) {
        await api.post(`/routes/update-status`, {
          deliveryRouteId,
          status,
          deliveryUserId: user?.id,
        });
        await fetchRoutes();
      } else if (user?.role === RoleEnum.USUARIO) {
        // If user is a regular user, show the completion code
        const route = routes.find(r => r.id === deliveryRouteId);
        console.log("Ruta seleccionada:", route);
        if (route && route.completionCode) {
          setCompletionCode(route.completionCode);
          setShowCompletionCode(true);
        }
      }
    } catch (error: any) {
      console.error("Error al cambiar estado de la ruta:", error);
      Alert.alert('Error', 'No se pudo actualizar el estado de la ruta');
    } finally {
      setLoading(false);
    }
  };



  const handleQRScan = async (data: string) => {
    try {
      setShowScanner(false);
      
      const response = await api.post(`/routes/update-status`, {
        deliveryRouteId: data,
        deliveryUserId: user?.id,
        status: "IN_PROGRESS"
      });
      
      if (response.data) {
        const routeData = response.data;
        
        const formattedPackageInfo = {
          id: routeData.id.toString(),
          packageCode: routeData.id.toString(),
          description: routeData.packageInfo,
          recipient: {
            name: routeData.userInfo,
            address: routeData.destination,
          },
          route: {
            id: routeData.id,
            origin: routeData.origin,
            destination: routeData.destination,
          }
        };
        
        setPackageInfo(formattedPackageInfo);
        setShowPackageInfo(true);
        
        fetchRoutes();
      } else {
        throw new Error('No se pudo obtener la información de la ruta');
      }
    } catch (error) {
      console.error("Error al procesar el código QR:", error);
      Alert.alert(
        'Error',
        'No se pudo obtener la información de la ruta. Por favor, verifica el código QR.'
      );
    }
  };

  const handleViewCompletionCode = (route: DeliveryRouteResponseWithUserInfo) => {
    console.log("Mostrando código de confirmación:", route.completionCode);
    if (route.completionCode) {
      setCompletionCode(route.completionCode);
      setShowCompletionCode(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
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
                name="location-outline" 
                size={64} 
                color="#666666" 
                style={styles.emptyIcon}
              />
              <Text style={styles.emptySubtitle}>
                {user?.role === RoleEnum.REPARTIDOR 
                  ? "No tienes rutas asignadas en este momento."
                  : "No tienes envíos en este momento."
                }
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            console.log(`Renderizando ruta ${item.id}, rol: ${user?.role}, tiene código: ${!!item.completionCode}`);
            return (
              <RouteCard
                route={item}
                role={user?.role || ""}
                onPress={(routeId: number, status: string) => handleChangeRouteStatus(routeId, status)}
                onViewCode={user?.role === RoleEnum.USUARIO ? () => handleViewCompletionCode(item) : undefined}
                showCodeButton={user?.role === RoleEnum.USUARIO && !!item.completionCode}
              />
            );
          }}
        />
        
        {user?.role === RoleEnum.REPARTIDOR && (
          <Pressable 
            style={styles.fabButton} 
            onPress={() => setShowScanner(true)}
          >
            <Ionicons name="qr-code" size={28} color="white" />
          </Pressable>
        )}
        
        <QRScanner
          visible={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={handleQRScan}
        />
        
        <PackageInfoModal
          visible={showPackageInfo}
          packageInfo={packageInfo}
          onClose={() => setShowPackageInfo(false)}
        />

        <CompletionCodeModal
          visible={showCompletionCode}
          completionCode={completionCode}
          onClose={() => setShowCompletionCode(false)}
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
  fabButton: {
    position: 'absolute',
    right: 20,
    bottom: 20, // Ajustado para estar muchísimo más abajo, casi pegado al tab navigator
    backgroundColor: '#3B82F6',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 999,
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
