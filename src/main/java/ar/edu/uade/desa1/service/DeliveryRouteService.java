package ar.edu.uade.desa1.service;

import ar.edu.uade.desa1.domain.entity.DeliveryRoute;
import ar.edu.uade.desa1.domain.enums.RouteStatus;
import ar.edu.uade.desa1.domain.request.CreateRouteRequest;
import ar.edu.uade.desa1.domain.response.DeliveryRouteResponse;

import java.util.List;

public interface DeliveryRouteService {
    DeliveryRoute createRoute(CreateRouteRequest request);
    List<DeliveryRouteResponse> getAllRoutes();
    DeliveryRoute getRouteById(Long id);
    DeliveryRouteResponse updateRouteStatus(Long routeId, String status, Long deliveryUserId);
    List<DeliveryRouteResponse> getCompletedRoutesByUser(Long userId);
}
