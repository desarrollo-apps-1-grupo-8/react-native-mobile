package ar.edu.uade.desa1.controller;

import ar.edu.uade.desa1.domain.entity.DeliveryRoute;
import ar.edu.uade.desa1.domain.request.CreateRouteRequest;
import ar.edu.uade.desa1.domain.request.UpdateRouteStatusRequest;
import ar.edu.uade.desa1.domain.response.DeliveryRouteResponse;
import ar.edu.uade.desa1.service.DeliveryRouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/v1/routes")
@RequiredArgsConstructor
public class DeliveryRouteController {

    private final DeliveryRouteService deliveryRouteService;

    @PostMapping
    public ResponseEntity<DeliveryRoute> createRoute(@RequestBody CreateRouteRequest request) {
        return ResponseEntity.ok(deliveryRouteService.createRoute(request));
    }

    @GetMapping
    public ResponseEntity<List<DeliveryRouteResponse>> getAllRoutes() {
        return ResponseEntity.ok(deliveryRouteService.getAllRoutes());
    }

    @GetMapping("/deliveryUser/{deliveryUserId}")
    public ResponseEntity<List<DeliveryRouteResponse>> getAllRoutesByDeliveryUserId(@PathVariable("deliveryUserId") Long deliveryUserId) {
        return ResponseEntity.ok(deliveryRouteService.getAllRoutesByDeliveryUserId(deliveryUserId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DeliveryRouteResponse>> getAllRoutesByUserId(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(deliveryRouteService.getAllRoutesByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryRoute> getRouteById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(deliveryRouteService.getRouteById(id));
    }

    @PostMapping("/update-status")
    public ResponseEntity<DeliveryRouteResponse> updateRouteStatus(@RequestBody UpdateRouteStatusRequest request) {
        return ResponseEntity.ok(deliveryRouteService.updateRouteStatus(
            request.getDeliveryRouteId(), 
            request.getStatus(),
            request.getDeliveryUserId()
        ));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<DeliveryRouteResponse>> getCompletedRoutes(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(deliveryRouteService.getCompletedRoutesByUser(userId));
    }
}

