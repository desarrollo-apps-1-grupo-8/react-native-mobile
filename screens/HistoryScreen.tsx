import { RouteCard } from "@/components/shipments/RouteCard";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../context/SessionContext";
import { DeliveryRouteResponseWithUserInfo } from "../types/route";

export const HistoryScreen: React.FC = () => {
  const { session, user } = useSession();
  const [routes, setRoutes] = useState<DeliveryRouteResponseWithUserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
      response = await api.get(`/routes/history/${user?.id}`);
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
                name="time-outline" 
                size={64} 
                color="#666666" 
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>
                Sin rutas completadas
              </Text>
              <Text style={styles.emptySubtitle}>
                No tienes rutas completadas en tu historial aún.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <RouteCard
              route={item}
              role={RoleEnum.REPARTIDOR}
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
