package com.tnc.library.respositories;

import com.tnc.library.pojo.BorrowSlip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BorrowSlipRepository extends JpaRepository<BorrowSlip, Integer> {
}
