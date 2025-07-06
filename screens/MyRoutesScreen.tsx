import api from "@/services/api";
import { RoleEnum } from "@/utils/roleEnum";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from "@react-navigation/native";
import { HttpStatusCode } from "axios";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteCard } from "../components/RouteCard";
import CompletionCodeInput from "../components/shipments/CompletionCodeInput";
import { useSession } from "../context/SessionContext";
import { DeliveryRouteResponseWithUserInfo } from "../types/route";

export const MyRoutesScreen: React.FC = () => {
  const { session, user } = useSession();
  const [routes, setRoutes] = useState<DeliveryRouteResponseWithUserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCompletionCodeInput, setShowCompletionCodeInput] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
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
        if (status === "COMPLETED") {
          setSelectedRouteId(deliveryRouteId);
          setShowCompletionCodeInput(true);
          setLoading(false);
          return;
        }
        
        await api.post(`/routes/update-status`, {
          deliveryRouteId,
          status,
          deliveryUserId: user?.id,
        });
        await fetchRoutes();
      }
    } catch (error: any) {
      console.error("Error al cambiar estado de la ruta:", error);
      Alert.alert('Error', 'No se pudo actualizar el estado de la ruta');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCompletionCode = async (code: string) => {
    if (!selectedRouteId) return;
    
    try {
      const response = await api.post(`/routes/update-status`, {
        deliveryRouteId: selectedRouteId,
        status: "COMPLETED",
        deliveryUserId: user?.id,
        completionCode: code
      });
      
      if (response.status !== HttpStatusCode.Ok) {
        throw new Error('Código de confirmación inválido');
      }
      
      await fetchRoutes();
      return Promise.resolve();
    } catch (error: any) {
      console.error("Error al verificar el código de confirmación:", error);
      return Promise.reject(new Error('Código de confirmación inválido'));
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

        <CompletionCodeInput
          visible={showCompletionCodeInput}
          routeId={selectedRouteId || 0}
          onClose={() => {
            setShowCompletionCodeInput(false);
          }}
          onSubmit={handleSubmitCompletionCode}
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
