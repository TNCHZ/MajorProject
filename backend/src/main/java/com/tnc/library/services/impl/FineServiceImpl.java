package com.tnc.library.services.impl;

import com.tnc.library.dto.MonthlyBorrowingDTO;
import com.tnc.library.dto.MonthlyFineDTO;
import com.tnc.library.pojo.Fine;
import com.tnc.library.respositories.FineRepository;
import com.tnc.library.services.FineService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FineServiceImpl implements FineService {
    @Autowired
    private FineRepository fineRepository;

    @Transactional
    @Override
    public Fine addOrUpdateFine(Fine f) {
        return this.fineRepository.save(f);
    }

    @Override
    public Fine getFineById(Integer id) {
        Optional<Fine> fine = this.fineRepository.findById(id);
        return fine.orElse(null);
    }

    @Override
    public Page<Fine> getFines(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return this.fineRepository.findAll(pageable);
    }

    @Override
    public Page<Fine> getFineByReaderPhone(String phone, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return fineRepository.findByReader_Phone(phone, pageable);
    }

    @Override
    public List<MonthlyFineDTO> getMonthlyFines(int year) {
        List<Object[]> raw = this.fineRepository.getMonthlyRevenue(year);
        List<MonthlyFineDTO> result = new ArrayList<>();

        String[] months = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};

        for (Object[] row : raw) {
            Integer month = ((Number) row[0]).intValue();
            BigDecimal total = (BigDecimal) row[1];  // vì SUM(amount) sẽ trả về BigDecimal
            result.add(new MonthlyFineDTO(months[month - 1], total));
        }

        return result;
    }

    @Transactional
    @Override
    public void deleteFine(Fine fine) {
        this.fineRepository.delete(fine);
    }

}
