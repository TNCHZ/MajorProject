package com.tnc.library.respositories;

import com.tnc.library.pojo.MembershipRenewal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MembershipRenewalRepository extends JpaRepository<MembershipRenewal, Integer> {
    @Query("SELECT tm.canReadEbook FROM MembershipRenewal mr " +
            "JOIN mr.typeId tm " +
            "WHERE mr.readerId.id = :readerId " +
            "AND CURRENT_TIMESTAMP BETWEEN mr.startDate AND mr.expireDate " +
            "ORDER BY mr.expireDate DESC")
    Boolean canReaderReadEbook(@Param("readerId") Integer readerId);

}
