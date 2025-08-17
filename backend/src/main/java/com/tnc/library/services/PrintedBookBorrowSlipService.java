package com.tnc.library.services;

import com.tnc.library.pojo.BorrowSlip;

import java.util.List;

public interface PrintedBookBorrowSlipService {
    boolean addOrUpdatePBBS(BorrowSlip borrowSlip, List<Integer> bookIds);
}
