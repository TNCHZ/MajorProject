package com.tnc.library.respositories;

import com.tnc.library.pojo.BorrowSlip;
import com.tnc.library.pojo.Reader;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowSlipRepository extends JpaRepository<BorrowSlip, Integer> {
    List<BorrowSlip> findByReaderId(Reader readerId);
}
