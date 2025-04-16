package ar.edu.uade.desa1.service;

import ar.edu.uade.desa1.domain.entity.DeliveryRoute;
import ar.edu.uade.desa1.domain.enums.RouteStatus;
import ar.edu.uade.desa1.domain.request.CreateRouteRequest;
import ar.edu.uade.desa1.exception.NotFoundException;
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
    @Transactional
    public DeliveryRoute createRoute(CreateRouteRequest request) {
        try {
            DeliveryRoute route = DeliveryRoute.builder()
                    .packageInfo(request.getPackageInfo())
                    .origin(request.getOrigin())
                    .destination(request.getDestination())
                    .status(request.getStatus())
                    .userId(request.getUserId())
                    .build();
            return deliveryRouteRepository.save(route);
        } catch (Exception e) {
            throw new RuntimeException("Error creating route: " + e.getMessage());
        }
    }

    @Override
    public List<DeliveryRoute> getAllRoutes() {
        try {
            return deliveryRouteRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Error getting all routes: " + e.getMessage());
        }
    }

    @Override
    public DeliveryRoute getRouteById(Long id) {
        try {
            return deliveryRouteRepository.findById(id)
                    .orElseThrow(() -> new NotFoundException("Route with id " + id + " not found"));
        } catch (NotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error getting route by id: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public DeliveryRoute updateRouteStatus(Long routeId, RouteStatus status, Long deliveryUserId) {
        try {
            DeliveryRoute route = deliveryRouteRepository.findById(routeId)
                    .orElseThrow(() -> new NotFoundException("Route with id " + routeId + " not found"));

            // Solo permitir cambios de estado si el usuario es el repartidor asignado
            if (route.getDeliveryUserId() != null && !route.getDeliveryUserId().equals(deliveryUserId)) {
                throw new RuntimeException("Only the assigned delivery user can change the route status");
            }

            // Si el estado es IN_PROGRESS, asignar al repartidor
            if (RouteStatus.IN_PROGRESS.equals(status)) {
                route.setDeliveryUserId(deliveryUserId);
            }

            route.setStatus(status);
            return deliveryRouteRepository.save(route);
        } catch (NotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error updating route status: " + e.getMessage());
        }
    }

    @Override
    public List<DeliveryRoute> getCompletedRoutesByUser(Long userId) {
        try {
            return deliveryRouteRepository.findByUserIdAndStatus(userId, RouteStatus.COMPLETED);
        } catch (Exception e) {
            throw new RuntimeException("Error getting completed routes by user: " + e.getMessage());
        }
    }
}
