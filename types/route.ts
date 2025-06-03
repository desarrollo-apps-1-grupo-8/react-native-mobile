export interface DeliveryRouteResponseWithUserInfo {
  id: number;
  packageInfo: string;
  origin: string;
  destination: string;
  status: string;
  userInfo: string;
  deliveryUserInfo: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryRouteResponse {
  id: number;
  packageInfo: string;
  origin: string;
  destination: string;
  status: string;
  userId: number;
  deliveryUserId: number;
  createdAt: string;
  updatedAt: string;
} 