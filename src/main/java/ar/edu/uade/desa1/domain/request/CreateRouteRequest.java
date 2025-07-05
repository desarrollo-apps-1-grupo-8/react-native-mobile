package ar.edu.uade.desa1.domain.request;

import ar.edu.uade.desa1.domain.enums.RouteStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateRouteRequest {
    private String packageInfo;
    private String origin;
    private String destination;
    private RouteStatus status;
    private Long userId;
    private Long deliveryUserId;

    public Long getDeliveryUserId() {
        return deliveryUserId;
    }

    public void setDeliveryUserId(Long deliveryUserId) {
        this.deliveryUserId = deliveryUserId;
    }
} 