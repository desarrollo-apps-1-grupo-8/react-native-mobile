package ar.edu.uade.desa1.service;

import ar.edu.uade.desa1.domain.entity.DeliveryRoute;
import ar.edu.uade.desa1.repository.DeliveryRouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeliveryRouteServiceImpl implements DeliveryRouteService {

    private final DeliveryRouteRepository deliveryRouteRepository;

    @Override
    public List<DeliveryRoute> getAllRoutes() {
        return deliveryRouteRepository.findAll();
    }

    @Override
    public DeliveryRoute getRouteById(Long id) {
        return deliveryRouteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Route not found"));
    }

    @Override
    @Transactional
    public DeliveryRoute unlockRoute(String qrCode, Long userId) {
        DeliveryRoute route = deliveryRouteRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new RuntimeException("Invalid QR Code"));
        if (!"available".equals(route.getStatus())) {
            throw new RuntimeException("Route is not available");
        }
        route.setStatus("in_progress");
        route.setAssignedUserId(userId);
        return deliveryRouteRepository.save(route);
    }

    @Override
    @Transactional
    public DeliveryRoute completeRoute(Long id, String confirmationCode) {
        // Para efectos de esta entrega, se asume que el confirmationCode es válido.
        DeliveryRoute route = deliveryRouteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Route not found"));
        if (!"in_progress".equals(route.getStatus())) {
            throw new RuntimeException("Route is not in progress");
        }
        route.setStatus("completed");
        return deliveryRouteRepository.save(route);
    }

    @Override
    public List<DeliveryRoute> getCompletedRoutesByUser(Long userId) {
        return deliveryRouteRepository.findByAssignedUserIdAndStatus(userId, "completed");
    }
}
