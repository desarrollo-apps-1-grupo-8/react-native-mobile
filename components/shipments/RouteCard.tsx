import { DeliveryRouteResponseWithUserInfo } from "@/types/route";
import { openLocationInMaps } from "@/utils/mapUtils";
import { RoleEnum } from "@/utils/roleEnum";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface RouteCardProps {
  route: DeliveryRouteResponseWithUserInfo;
  role: string;
  onPress: (routeId: number, status: string) => void;
  onViewCode?: () => void;
  showCodeButton?: boolean;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  role,
  onPress,
  onViewCode,
  showCodeButton = false,
}) => {
  const status = route.status;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return { bg: "#f59e0b", text: "white" };
      case "IN_PROGRESS":
        return { bg: "#3b82f6", text: "white" };
      case "COMPLETED":
        return { bg: "#22c55e", text: "white" };
      default:
        return { bg: "#6b7280", text: "white" };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Pendiente";
      case "IN_PROGRESS":
        return "En progreso";
      case "COMPLETED":
        return "Completada";
      default:
        return "Desconocido";
    }
  };

  const getActionButtonText = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "Completar";
      default:
        return "";
    }
  };

  const getNextStatus = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "IN_PROGRESS";
      case "IN_PROGRESS":
        return "COMPLETED";
      default:
        return "";
    }
  };

  const renderActionButton = () => {
    if (role !== RoleEnum.REPARTIDOR || route.status !== "IN_PROGRESS") {
      return null;
    }

    return (
      <Pressable
        style={styles.actionButton}
        onPress={() => onPress(route.id, getNextStatus(route.status))}
      >
        <Ionicons
          name="checkmark-circle-outline"
          size={18}
          color="#fff"
          style={styles.actionIcon}
        />
        <Text style={styles.actionButtonText}>
          {getActionButtonText(route.status)}
        </Text>
      </Pressable>
    );
  };

  const handleOpenMaps = () => {
    openLocationInMaps(route.destination);
  };

  const renderMapButton = () => {
    if (
      role !== RoleEnum.REPARTIDOR ||
      (route.status !== "IN_PROGRESS" && route.status !== "COMPLETED")
    ) {
      return null;
    }

    return (
      <Pressable style={styles.mapButton} onPress={handleOpenMaps}>
        <Ionicons
          name="map-outline"
          size={18}
          color="#fff"
          style={styles.mapIcon}
        />
        <Text style={styles.mapButtonText}>Ver mapa</Text>
      </Pressable>
    );
  };

  const renderViewCodeButton = () => {
    if (!showCodeButton || !onViewCode) {
      return null;
    }

    return (
      <Pressable style={styles.viewCodeButton} onPress={onViewCode}>
        <Ionicons
          name="key-outline"
          size={18}
          color="#fff"
          style={styles.viewCodeIcon}
        />
        <Text style={styles.viewCodeText}>Ver código</Text>
      </Pressable>
    );
  };

  const statusStyle = getStatusStyle(status);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Ruta #{route.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={styles.statusText}>{getStatusText(route.status)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Origen:</Text>
          <Text style={styles.value}>{route.origin}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Destino:</Text>
          <Text style={styles.value}>{route.destination}</Text>
        </View>
        {role === RoleEnum.REPARTIDOR && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{route.userInfo}</Text>
          </View>
        )}
        {role === RoleEnum.USUARIO && route.deliveryUserInfo && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Repartidor:</Text>
            <Text style={styles.value}>{route.deliveryUserInfo}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {renderMapButton()}
        {renderActionButton()}
        {renderViewCodeButton()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#ffffff",
  },
  content: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    width: 90,
    fontSize: 14,
    fontWeight: "500",
    color: "#9ca3af",
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: "#ffffff",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 12,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  mapIcon: {
    marginRight: 6,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  viewCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6b7280",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 12,
    shadowColor: "#6b7280",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  viewCodeIcon: {
    marginRight: 6,
  },
  viewCodeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
});
