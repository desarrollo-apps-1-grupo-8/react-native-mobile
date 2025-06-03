import React from "react";
import { Text, View } from "react-native";
import { DeliveryRouteResponseWithUserInfo } from "../types/route";
import { RouteStatusEnum } from "../utils/routeStatusEnum";

interface Props {
  route: DeliveryRouteResponseWithUserInfo;
}

export const HistoryRouteCard: React.FC<Props> = ({ route }) => {
  const statusSpanish = RouteStatusEnum[route.status as keyof typeof RouteStatusEnum]?.spanish || route.status;
  const onlyDate = route.updatedAt.split("T")[0];

  return (
    <View style={{ margin: 10, padding: 10, backgroundColor: "#f5f5f5", borderRadius: 8 }}>
      <Text>{route.packageInfo}</Text>
      <Text>{route.origin} ➝ {route.destination}</Text>
      <Text>{statusSpanish}</Text>
      <Text>Cliente: {route.userInfo}</Text>
      <Text>Fecha: {onlyDate}</Text>
    </View>
  );
}; 