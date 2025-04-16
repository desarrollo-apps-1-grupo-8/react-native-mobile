package ar.edu.uade.desa1.service;

import ar.edu.uade.desa1.domain.entity.DeliveryRoute;
import ar.edu.uade.desa1.domain.enums.RouteStatus;
import ar.edu.uade.desa1.domain.request.CreateRouteRequest;
import java.util.List;

public interface DeliveryRouteService {
    DeliveryRoute createRoute(CreateRouteRequest request);
    List<DeliveryRoute> getAllRoutes();
    DeliveryRoute getRouteById(Long id);
    DeliveryRoute updateRouteStatus(Long routeId, RouteStatus status, Long deliveryUserId);
    List<DeliveryRoute> getCompletedRoutesByUser(Long userId);
}
