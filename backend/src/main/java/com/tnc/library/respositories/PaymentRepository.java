package com.tnc.library.respositories;

import com.tnc.library.pojo.Payment;
import com.tnc.library.pojo.Reader;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    // Nếu muốn lấy tổng hợp theo loại
    @Query("""
        SELECT
            CASE
                WHEN p.membershipRenewal IS NOT NULL THEN 'MEMBERSHIP'
                WHEN p.fine IS NOT NULL THEN 'FINE'
            END as type,
            SUM(p.amount)
        FROM Payment p
        WHERE p.isPaid = true
          AND YEAR(p.paymentDate) = :year
          AND (:month IS NULL OR MONTH(p.paymentDate) = :month)
        GROUP BY type
    """)
    List<Object[]> getRevenueByType(@Param("year") int year, @Param("month") Integer month);
    Page<Payment> findAll(Pageable pageable);
}
