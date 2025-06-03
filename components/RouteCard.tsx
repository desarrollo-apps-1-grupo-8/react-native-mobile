import React from "react";
import { Button, Text, View } from "react-native";
import { DeliveryRouteResponseWithUserInfo } from "../types/route";
import { RouteStatusEnum } from "../utils/routeStatusEnum";

interface Props {
  route: DeliveryRouteResponseWithUserInfo;
  role: string;
  onAction: (newStatus: string) => void;
}

export const RouteCard: React.FC<Props> = ({ route, role, onAction }) => {
  const isRepartidor = role === "REPARTIDOR";
  const status = route.status;
  const statusSpanish = RouteStatusEnum[status as keyof typeof RouteStatusEnum]?.spanish || status;

  return (
    <View style={{ margin: 10, padding: 10, backgroundColor: "#fff", borderRadius: 8 }}>
      <Text>Desde: {route.origin}</Text>
      <Text>Hacia: {route.destination}</Text>
      <Text>Estado: {statusSpanish}</Text>
      <Text>Cliente: {route.userInfo}</Text>
      <Text>Fecha: {route.updatedAt.split('T')[0]}</Text>
      {isRepartidor && status === "AVAILABLE" && (
        <Button title="Asignarme ruta" onPress={() => onAction("IN_PROGRESS")} />
      )}
      {isRepartidor && status === "IN_PROGRESS" && (
        <Button title="Finalizar ruta" onPress={() => onAction("COMPLETED")} />
      )}
    </View>
  );
}; 