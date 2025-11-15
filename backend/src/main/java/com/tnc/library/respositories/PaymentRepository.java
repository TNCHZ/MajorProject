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

    @Query("""
    SELECT 
        MONTH(p.paymentDate) AS month,
        CASE 
            WHEN p.membershipRenewal IS NOT NULL THEN 'MEMBERSHIP'
            WHEN p.fine IS NOT NULL THEN 'FINE'
        END AS type,
        SUM(p.amount)
    FROM Payment p
    WHERE p.isPaid = true
      AND YEAR(p.paymentDate) = :year
    GROUP BY MONTH(p.paymentDate), type
    ORDER BY MONTH(p.paymentDate)
""")
    List<Object[]> getRevenueByMonth(@Param("year") int year);

    @Query("""
    SELECT 
        DAY(p.paymentDate) AS day,
        CASE 
            WHEN p.membershipRenewal IS NOT NULL THEN 'MEMBERSHIP'
            WHEN p.fine IS NOT NULL THEN 'FINE'
        END AS type,
        SUM(p.amount)
    FROM Payment p
    WHERE p.isPaid = true
      AND YEAR(p.paymentDate) = :year
      AND MONTH(p.paymentDate) = :month
    GROUP BY DAY(p.paymentDate), type
    ORDER BY DAY(p.paymentDate)
""")
    List<Object[]> getRevenueByDay(@Param("year") int year, @Param("month") int month);
    Page<Payment> findAll(Pageable pageable);
}
