package com.tnc.library.respositories;

import com.tnc.library.enums.BorrowStatus;
import com.tnc.library.pojo.BorrowSlip;
import com.tnc.library.pojo.Reader;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowSlipRepository extends JpaRepository<BorrowSlip, Integer> {
    List<BorrowSlip> findByReaderId(Reader readerId);
    Integer countByStatus(BorrowStatus status);


    @Query("SELECT FUNCTION('MONTH', b.borrowDate) as month, COUNT(b) as borrowings " +
            "FROM BorrowSlip b " +
            "WHERE FUNCTION('YEAR', b.borrowDate) = :year " +
            "GROUP BY FUNCTION('MONTH', b.borrowDate) " +
            "ORDER BY month")
    List<Object[]> countBorrowingsByMonthYear(@Param("year") int year);

}
