package ar.edu.uade.desa1.domain.entity;

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

    // Valor único asociado al código QR
    @Column(name = "qr_code", nullable = false, unique = true)
    private String qrCode;

    @Column(name = "package_info")
    private String packageInfo;

    @Column(name = "origin")
    private String origin;

    @Column(name = "destination")
    private String destination;

    // Estado de la ruta: available, in_progress, completed
    @Column(name = "status", nullable = false)
    private String status;

    // Identificador del usuario (repartidor) asignado a la ruta
    @Column(name = "assigned_user_id")
    private Long assignedUserId;
}
