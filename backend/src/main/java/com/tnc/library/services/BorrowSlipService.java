package com.tnc.library.services;

import com.tnc.library.pojo.BorrowSlip;
import com.tnc.library.pojo.Reader;
import org.springframework.data.domain.Page;

import java.util.List;

public interface BorrowSlipService {
    BorrowSlip addOrUpdateBorrowSlip(BorrowSlip b);

    List<BorrowSlip> getBorrowSlipByUserId(Reader readerId);

    BorrowSlip getBorrowSlipById(int id);

    void deleteBorrowSlip(BorrowSlip b);

    public Page<BorrowSlip> getBorrowSlips(int page, int size, String sortBy);
}
