package ar.edu.uade.desa1.repository;

import ar.edu.uade.desa1.domain.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
}
