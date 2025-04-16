package ar.edu.uade.desa1.domain.request;

import ar.edu.uade.desa1.domain.enums.RouteStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateRouteStatusRequest {
    private Long deliveryRouteId;
    private RouteStatus status;
    private Long deliveryUserId;
} 