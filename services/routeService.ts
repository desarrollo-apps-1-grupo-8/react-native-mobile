import axios from "axios";
import { DeliveryRouteResponseWithUserInfo } from "../types/route";

const API_URL = "http://localhost:8080/api/v1/routes";

export const getRoutesByUserId = (userId: number, token: string) =>
  axios.get<DeliveryRouteResponseWithUserInfo[]>(`${API_URL}/routes/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getAllRoutes = (token: string) =>
  axios.get<DeliveryRouteResponseWithUserInfo[]>(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const updateRouteStatus = (data: { deliveryRouteId: number, status: string, deliveryUserId: number }, token: string) =>
  axios.post<DeliveryRouteResponseWithUserInfo>(`${API_URL}/update-status`, data, {
    headers: { Authorization: `Bearer ${token}` }
  }); 