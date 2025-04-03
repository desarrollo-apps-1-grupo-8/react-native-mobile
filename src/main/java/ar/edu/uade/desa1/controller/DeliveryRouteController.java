package ar.edu.uade.desa1.controller;

import ar.edu.uade.desa1.domain.entity.DeliveryRoute;
import ar.edu.uade.desa1.service.DeliveryRouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/routes")
@RequiredArgsConstructor
public class DeliveryRouteController {

    private final DeliveryRouteService deliveryRouteService;

    @GetMapping
    public ResponseEntity<List<DeliveryRoute>> getAllRoutes() {
        return ResponseEntity.ok(deliveryRouteService.getAllRoutes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryRoute> getRouteById(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryRouteService.getRouteById(id));
    }

    @PostMapping("/unlock")
    public ResponseEntity<DeliveryRoute> unlockRoute(@RequestParam String qrCode,
                                                     @RequestParam Long userId) {
        return ResponseEntity.ok(deliveryRouteService.unlockRoute(qrCode, userId));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<DeliveryRoute> completeRoute(@PathVariable Long id,
                                                       @RequestParam String confirmationCode) {
        return ResponseEntity.ok(deliveryRouteService.completeRoute(id, confirmationCode));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<DeliveryRoute>> getCompletedRoutes(@PathVariable Long userId) {
        return ResponseEntity.ok(deliveryRouteService.getCompletedRoutesByUser(userId));
    }
}
