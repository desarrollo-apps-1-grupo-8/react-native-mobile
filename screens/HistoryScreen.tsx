import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, Text, View } from "react-native";
import { HistoryRouteCard } from "../components/HistoryRouteCard";
import { useAuth } from "../context/AuthContext";
import { getRoutesByUserId } from "../services/routeService";
import { DeliveryRouteResponseWithUserInfo } from "../types/route";

export const HistoryScreen: React.FC = () => {
  const { token, userId } = useAuth();
  const [routes, setRoutes] = useState<DeliveryRouteResponseWithUserInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoutes = useCallback(() => {
    if (!token || !userId) return;
    setLoading(true);
    getRoutesByUserId(userId, token)
      .then(res => setRoutes(res.data))
      .catch(() => Alert.alert("Error", "No se pudieron cargar las rutas"))
      .finally(() => setLoading(false));
  }, [token, userId]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <FlatList
        data={routes}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchRoutes} />}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No hay historial de rutas</Text>}
        renderItem={({ item }) => <HistoryRouteCard route={item} />}
      />
    </View>
  );
}; 