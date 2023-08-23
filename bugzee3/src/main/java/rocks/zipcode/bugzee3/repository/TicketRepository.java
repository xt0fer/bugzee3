package rocks.zipcode.bugzee3.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rocks.zipcode.bugzee3.domain.Ticket;

/**
 * Spring Data JPA repository for the Ticket entity.
 *
 * When extending this class, extend TicketRepositoryWithBagRelationships too.
 * For more information refer to https://github.com/jhipster/generator-jhipster/issues/17990.
 */
@Repository
public interface TicketRepository extends TicketRepositoryWithBagRelationships, JpaRepository<Ticket, Long> {
    @Query("select ticket from Ticket ticket where ticket.assignedTo.login = ?#{principal.username}")
    List<Ticket> findByAssignedToIsCurrentUser();

    @Query("select ticket from Ticket ticket where ticket.reportedBy.login = ?#{principal.username}")
    List<Ticket> findByReportedByIsCurrentUser();

    default Optional<Ticket> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findOneWithToOneRelationships(id));
    }

    default List<Ticket> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAllWithToOneRelationships());
    }

    default Page<Ticket> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAllWithToOneRelationships(pageable));
    }

    @Query(
        value = "select distinct ticket from Ticket ticket left join fetch ticket.project left join fetch ticket.assignedTo left join fetch ticket.reportedBy",
        countQuery = "select count(distinct ticket) from Ticket ticket"
    )
    Page<Ticket> findAllWithToOneRelationships(Pageable pageable);

    @Query(
        "select distinct ticket from Ticket ticket left join fetch ticket.project left join fetch ticket.assignedTo left join fetch ticket.reportedBy"
    )
    List<Ticket> findAllWithToOneRelationships();

    @Query(
        "select ticket from Ticket ticket left join fetch ticket.project left join fetch ticket.assignedTo left join fetch ticket.reportedBy where ticket.id =:id"
    )
    Optional<Ticket> findOneWithToOneRelationships(@Param("id") Long id);
}
