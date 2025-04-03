package ar.edu.uade.desa1.service;

import ar.edu.uade.desa1.domain.entity.DeliveryRoute;
import java.util.List;

public interface DeliveryRouteService {
    List<DeliveryRoute> getAllRoutes();
    DeliveryRoute getRouteById(Long id);
    DeliveryRoute unlockRoute(String qrCode, Long userId);
    DeliveryRoute completeRoute(Long id, String confirmationCode);
    List<DeliveryRoute> getCompletedRoutesByUser(Long userId);
}
