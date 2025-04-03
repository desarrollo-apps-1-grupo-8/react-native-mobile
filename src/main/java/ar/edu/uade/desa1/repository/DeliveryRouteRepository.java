package ar.edu.uade.desa1.repository;

import ar.edu.uade.desa1.domain.entity.DeliveryRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRouteRepository extends JpaRepository<DeliveryRoute, Long> {
    Optional<DeliveryRoute> findByQrCode(String qrCode);
    List<DeliveryRoute> findByAssignedUserIdAndStatus(Long userId, String status);
}
