package com.tnc.library.respositories;

import com.tnc.library.pojo.Fine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface FineRepository extends JpaRepository<Fine, Integer> {
    Page<Fine> findAll(Pageable pageable);

    Page<Fine> findByReader_Phone(String phone, Pageable pageable);


    @Query("SELECT FUNCTION('MONTH', f.issuedAt) as month, SUM(f.amount) as total " +
            "FROM Fine f " +
            "WHERE FUNCTION('YEAR', f.issuedAt) = :year " +
            "GROUP BY FUNCTION('MONTH', f.issuedAt) " +
            "ORDER BY month")
    List<Object[]> getMonthlyRevenue(@Param("year") int year);
}
