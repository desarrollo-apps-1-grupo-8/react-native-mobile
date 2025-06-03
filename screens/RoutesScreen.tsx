import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, Text, View } from "react-native";
import { RouteCard } from "../components/RouteCard";
import { useAuth } from "../context/AuthContext";
import { getAllRoutes, getRoutesByUserId, updateRouteStatus } from "../services/routeService";
import { DeliveryRouteResponseWithUserInfo } from "../types/route";
import { RoleEnum } from "../utils/roleEnum";

export const RoutesScreen: React.FC = () => {
  const { token, userId, role } = useAuth();
  const [routes, setRoutes] = useState<DeliveryRouteResponseWithUserInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoutes = useCallback(() => {
    if (!token || !userId || !role) return;
    setLoading(true);
    const fetchFn = role === RoleEnum.USUARIO ? getRoutesByUserId(userId, token) : getAllRoutes(token);
    fetchFn
      .then(res => setRoutes(res.data))
      .catch(() => Alert.alert("Error", "No se pudieron cargar las rutas"))
      .finally(() => setLoading(false));
  }, [token, userId, role]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleAction = (routeId: number, newStatus: string) => {
    if (!token || !userId) return;
    updateRouteStatus({ deliveryRouteId: routeId, status: newStatus, deliveryUserId: userId }, token)
      .then(() => fetchRoutes())
      .catch(() => Alert.alert("Error", "No se pudo actualizar el estado de la ruta"));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <FlatList
        data={routes}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchRoutes} />}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No hay rutas disponibles</Text>}
        renderItem={({ item }) => (
          <RouteCard
            route={item}
            role={role || ""}
            onAction={newStatus => handleAction(item.id, newStatus)}
          />
        )}
      />
    </View>
  );
}; 