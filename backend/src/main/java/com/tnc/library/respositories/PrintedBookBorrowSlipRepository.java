package com.tnc.library.respositories;

import com.tnc.library.pojo.BorrowSlip;
import com.tnc.library.pojo.PrintedBookBorrowSlip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface PrintedBookBorrowSlipRepository extends JpaRepository<PrintedBookBorrowSlip, Integer> {
    List<PrintedBookBorrowSlip> findByBorrowSlipId(BorrowSlip borrowSlip);
}
