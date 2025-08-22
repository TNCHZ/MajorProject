package com.tnc.library.services;

import com.tnc.library.pojo.BorrowSlip;
import com.tnc.library.pojo.PrintedBookBorrowSlip;

import java.util.List;

public interface PrintedBookBorrowSlipService {
    boolean addOrUpdatePBBS(BorrowSlip borrowSlip, List<Integer> bookIds);
    List<PrintedBookBorrowSlip> getByBorrowSlip(BorrowSlip borrowSlip);
}
