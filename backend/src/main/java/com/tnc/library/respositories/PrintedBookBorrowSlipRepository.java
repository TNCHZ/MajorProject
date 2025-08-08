package com.tnc.library.respositories;

import com.tnc.library.pojo.PrintedBookBorrowSlip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface PrintedBookBorrowSlipRepository extends JpaRepository<PrintedBookBorrowSlip, Integer> {
}
