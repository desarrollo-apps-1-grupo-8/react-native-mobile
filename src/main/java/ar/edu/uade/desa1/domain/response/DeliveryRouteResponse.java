package ar.edu.uade.desa1.domain.response;

import ar.edu.uade.desa1.domain.enums.RouteStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeliveryRouteResponse {

    private Long id;
    private String packageInfo;
    private String origin;
    private String destination;
    private RouteStatus status;

    private String userInfo;
    private String deliveryUserInfo;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}