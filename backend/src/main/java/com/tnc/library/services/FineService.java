package com.tnc.library.services;

import com.tnc.library.dto.MonthlyFineDTO;
import com.tnc.library.pojo.BorrowSlip;
import com.tnc.library.pojo.Fine;
import com.tnc.library.pojo.User;
import org.springframework.data.domain.Page;

import java.util.List;

public interface FineService {
    Fine addOrUpdateFine(Fine f);
    Fine getFineById(Integer id);
    public Page<Fine> getFines(int page, int size, String sortBy);
    Page<Fine> getFineByReaderPhone(String phone, int page, int size);

    List<MonthlyFineDTO> getMonthlyFines(int year);

    void deleteFine(Fine fine);
}
