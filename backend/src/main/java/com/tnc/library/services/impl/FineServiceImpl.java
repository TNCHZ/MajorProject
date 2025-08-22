package com.tnc.library.services.impl;

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
    public Page<Fine> getFines(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return this.fineRepository.findAll(pageable);
    }
}
