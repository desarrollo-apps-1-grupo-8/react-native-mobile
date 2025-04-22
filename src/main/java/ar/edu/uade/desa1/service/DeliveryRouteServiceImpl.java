package ar.edu.uade.desa1.service;

import ar.edu.uade.desa1.domain.entity.DeliveryRoute;
import ar.edu.uade.desa1.domain.entity.User;
import ar.edu.uade.desa1.domain.enums.RouteStatus;
import ar.edu.uade.desa1.domain.request.CreateRouteRequest;
import ar.edu.uade.desa1.domain.response.DeliveryRouteResponse;
import ar.edu.uade.desa1.exception.NotFoundException;
import ar.edu.uade.desa1.repository.DeliveryRouteRepository;
import ar.edu.uade.desa1.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeliveryRouteServiceImpl implements DeliveryRouteService {

    private final DeliveryRouteRepository deliveryRouteRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public DeliveryRoute createRoute(CreateRouteRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new NotFoundException("User not found for id: " + request.getUserId()));

        try {
            DeliveryRoute route = DeliveryRoute.builder()
                    .packageInfo(request.getPackageInfo())
                    .origin(request.getOrigin())
                    .destination(request.getDestination())
                    .status(request.getStatus())
                    .user(user)
                    .createdAt(LocalDateTime.now())
                    .build();

            return deliveryRouteRepository.save(route);

        } catch (Exception e) {
            throw new RuntimeException("Error creating route: " + e.getMessage());
        }
    }

    @Override
    public List<DeliveryRouteResponse> getAllRoutes() {
        try {
            var routes = deliveryRouteRepository.findAll();

            return routes.stream().map(route -> DeliveryRouteResponse.builder()
                    .id(route.getId())
                    .userInfo(route.getUser().getFirstName() + " " + route.getUser().getLastName())
                    .packageInfo(route.getPackageInfo())
                    .origin(route.getOrigin())
                    .destination(route.getDestination())
                    .createdAt(route.getCreatedAt())
                    .updatedAt(route.getUpdatedAt())
                    .status(route.getStatus())
                    .build()).toList();
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
    public DeliveryRouteResponse updateRouteStatus(Long routeId, RouteStatus status, Long deliveryUserId) {
        try {
            User deliveryUser = userRepository.findById(deliveryUserId)
                    .orElseThrow(() -> new NotFoundException("Delivery user not found for id: " + deliveryUserId));

            DeliveryRoute route = deliveryRouteRepository.findById(routeId)
                    .orElseThrow(() -> new NotFoundException("Route with id " + routeId + " not found"));

            if (route.getDeliveryUser() != null && !route.getDeliveryUser().getId().equals(deliveryUserId)) {
                throw new RuntimeException("Only the assigned delivery user can change the route status");
            }

            if (RouteStatus.IN_PROGRESS.equals(status)) {
                route.setDeliveryUser(deliveryUser);
            }

            route.setStatus(status);
            route.setUpdatedAt(LocalDateTime.now());
            DeliveryRoute savedRoute = deliveryRouteRepository.save(route);

            return DeliveryRouteResponse.builder()
                    .id(savedRoute.getId())
                    .packageInfo(savedRoute.getPackageInfo())
                    .origin(savedRoute.getOrigin())
                    .destination(savedRoute.getDestination())
                    .status(savedRoute.getStatus())
                    .userInfo(savedRoute.getUser().getFirstName() + " " + savedRoute.getUser().getLastName())
                    .deliveryUserInfo(savedRoute.getDeliveryUser() != null ? savedRoute.getDeliveryUser().getFirstName() + " " + savedRoute.getDeliveryUser().getLastName(): null)
                    .createdAt(savedRoute.getCreatedAt())
                    .updatedAt(savedRoute.getUpdatedAt())
                    .build();

        } catch (NotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error updating route status: " + e.getMessage());
        }
    }


    @Override
    public List<DeliveryRouteResponse> getCompletedRoutesByUser(Long userId) {
        try {
            List<DeliveryRoute> routes = deliveryRouteRepository.findByUserIdAndStatus(userId, RouteStatus.COMPLETED.toString());

            if (routes.isEmpty()) {
                throw new NotFoundException("No completed routes found");
            }

            return routes.stream().map(route -> DeliveryRouteResponse.builder()
                    .id(route.getId())
                    .userInfo(route.getUser().getFirstName() + " " + route.getUser().getLastName())
                    .packageInfo(route.getPackageInfo())
                    .origin(route.getOrigin())
                    .destination(route.getDestination())
                    .createdAt(route.getCreatedAt())
                    .updatedAt(route.getUpdatedAt())
                    .status(route.getStatus())
                    .build()).toList();

        } catch (Exception e) {
            throw new RuntimeException("Error getting completed routes by user: " + e.getMessage());
        }
    }
}
