package com.tnc.library.respositories;

import com.tnc.library.enums.BorrowStatus;
import com.tnc.library.pojo.Book;
import com.tnc.library.pojo.BorrowSlip;
import com.tnc.library.pojo.Reader;
import com.tnc.library.pojo.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowSlipRepository extends JpaRepository<BorrowSlip, Integer> {
    Page<BorrowSlip> findByReader(User reader, Pageable pageable);
    Page<BorrowSlip> findAll(Pageable pageable);

    Integer countByStatus(BorrowStatus status);


    @Query("SELECT FUNCTION('MONTH', b.borrowDate) as month, COUNT(b) as borrowings " +
            "FROM BorrowSlip b " +
            "WHERE FUNCTION('YEAR', b.borrowDate) = :year " +
            "GROUP BY FUNCTION('MONTH', b.borrowDate) " +
            "ORDER BY month")
    List<Object[]> countBorrowingsByMonthYear(@Param("year") int year);

    @Query("""
            SELECT bs FROM BorrowSlip bs
            JOIN bs.printedBookBorrowSlips pbbs
            JOIN pbbs.printedBookId pb
            JOIN pb.book b
            WHERE b.id = :bookId AND bs.status = :status
            """)
    List<BorrowSlip> findBorrowingByBookId(@Param("bookId") Integer bookId,
                                           @Param("status") BorrowStatus status);


    List<BorrowSlip> findByStatusAndReader_Id(BorrowStatus status, Integer readerId);

}
