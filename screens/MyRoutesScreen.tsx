import api from "@/services/api";
import { RoleEnum } from "@/utils/roleEnum";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteCard } from "../components/RouteCard";
import { useSession } from "../context/SessionContext";
import { DeliveryRouteResponseWithUserInfo } from "../types/route";

export const MyRoutesScreen: React.FC = () => {
  const { session, user } = useSession();
  const [routes, setRoutes] = useState<DeliveryRouteResponseWithUserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchRoutes = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      let response;
      response = await api.get(`/routes/deliveryUser/${user?.id}`);
      console.log(response)

      setRoutes(response.data);
    } catch (error: any) {
      console.error("Error al obtener las rutas:", error);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }, [session, user]);

  useFocusEffect(
    useCallback(() => {
      fetchRoutes();
    }, [fetchRoutes])
  );

  const handleChangeRouteStatus = async (
    deliveryRouteId: number,
    status: string
  ) => {
    console.log("test!")
    setLoading(true);
    try {
      await api.post(`/routes/update-status`, {
        deliveryRouteId,
        status,
        deliveryUserId: user?.id,
      });
    } catch (error: any) {
      console.error("Error al cambiar estado de la ruta:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchRoutes} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Text style={{ textAlign: "center", color: "#fff" }}>
                No hay rutas asignadas a tu usuario actualmente
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
});
