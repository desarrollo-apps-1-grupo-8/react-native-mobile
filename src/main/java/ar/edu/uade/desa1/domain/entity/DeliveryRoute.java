package ar.edu.uade.desa1.domain.entity;

import ar.edu.uade.desa1.domain.enums.RouteStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "routes")
public class DeliveryRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "package_info")
    private String packageInfo;

    @Column(name = "origin")
    private String origin;

    @Column(name = "destination")
    private String destination;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RouteStatus status;

    // Usuario normal que creó la ruta
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // Repartidor asignado a la ruta
    @Column(name = "delivery_user_id")
    private Long deliveryUserId;
}
