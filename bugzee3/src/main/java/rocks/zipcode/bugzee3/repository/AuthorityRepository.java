package rocks.zipcode.bugzee3.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rocks.zipcode.bugzee3.domain.Authority;

/**
 * Spring Data JPA repository for the {@link Authority} entity.
 */
public interface AuthorityRepository extends JpaRepository<Authority, String> {}
