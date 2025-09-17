package com.tnc.library.services;

import com.tnc.library.dto.MonthlyBorrowingDTO;
import com.tnc.library.enums.BorrowStatus;
import com.tnc.library.pojo.BorrowSlip;
import com.tnc.library.pojo.Reader;
import org.springframework.data.domain.Page;

import java.util.List;

public interface BorrowSlipService {
    BorrowSlip addOrUpdateBorrowSlip(BorrowSlip b);

    Page<BorrowSlip> getBorrowSlipsByReader(Reader reader, int page, int size);

    BorrowSlip getBorrowSlipById(int id);

    void deleteBorrowSlip(BorrowSlip b);

    List<MonthlyBorrowingDTO> getMonthlyBorrowings(int year);

    Integer countByStatus(BorrowStatus borrowStatus);

    public Page<BorrowSlip> getBorrowSlips(int page, int size, String sortBy);

    List<BorrowSlip> getBorrowingSlipsByBookId(Integer bookId, BorrowStatus borrowStatus);
}
