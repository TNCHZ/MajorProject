package com.tnc.library.services;

import com.tnc.library.dto.MonthlyFineDTO;
import com.tnc.library.pojo.Fine;
import org.springframework.data.domain.Page;

import java.util.List;

public interface FineService {
    Fine addOrUpdateFine(Fine f);
    Fine getFineById(Integer id);
    public Page<Fine> getFines(int page, int size, String sortBy);

    List<MonthlyFineDTO> getMonthlyFines(int year);


}
