package ar.edu.uade.desa1.repository;

import ar.edu.uade.desa1.domain.entity.DeliveryRoute;
import ar.edu.uade.desa1.domain.enums.RouteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeliveryRouteRepository extends JpaRepository<DeliveryRoute, Long> {
    @Query(value = "SELECT * FROM routes WHERE user_id = :userId AND status = :status", nativeQuery = true)
    List<DeliveryRoute> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status);
}
